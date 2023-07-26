import TourModel from '../models/tourModel.js'
import { catchAsync } from '../utils/catchAsync.js'
import { AppError } from '../errors/appError.js'
import * as factory from './handlerFactory.js'
import multer from 'multer'
import sharp from 'sharp'

const multerStorage = multer.memoryStorage()

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true)
  } else {
    cb(new AppError('Only images are allowed.'), false)
  }
}

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
})

export const uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 }
])

export const resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next()

  req.body.imageCover = `tour-${req.params.id}-cover.jpg`
  await resizeAndSaveTourImage(req.files.imageCover[0].buffer, req.body.imageCover)

  req.body.images = []
  await Promise.all(
    req.files.images.map(async (image, index) => {
      const filename = `tour-${req.params.id}-${index}.jpg`
      req.body.images.push(filename)
      await resizeAndSaveTourImage(image.buffer, filename)
    })
  )

  next()
})

const resizeAndSaveTourImage = async (buffer, filename) =>
  await sharp(buffer)
    .resize(2000, 1333)
    .toFormat('jpg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${filename}`)

export const aliasTopTours = (req, res, next) => {
  req.queryMongo.pageable = {
    page: 1,
    limit: 5
  }
  req.queryMongo.sort = {
    ratingsAverage: -1,
    price: 1
  }
  next()
}

const extractTourFromRequest = (req) => {
  const {
    name, duration, maxGroupSize, difficulty, price, priceDiscount, summary, description, imageCover, images,
    startDates, secret, startLocation, locations, guides
  } = req.body

  return {
    name, duration, maxGroupSize, difficulty, price, priceDiscount, summary, description, imageCover, images,
    startDates, secret, startLocation, locations, guides
  }
}

export const getAllTours = factory.getAll(TourModel, 'tours')
export const getTour = factory.getOne(TourModel, 'tour', { path: 'reviews' })
export const createTour = factory.createOne(TourModel, 'tour', extractTourFromRequest)
export const updateTour = factory.updateOne(TourModel, 'tour', extractTourFromRequest)
export const deleteTour = factory.deleteOne(TourModel, 'tour')

export const getTourStats = catchAsync(async (req, res) => {
  const stats = await TourModel.aggregate([
    { $match: { ratingsAverage: { $gte: 4.5 } } },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numRatings: { $sum: '$ratingsQuantity' },
        numTours: { $sum: 1 },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    },
    { $sort: { avgPrice: 1 } }
  ])

  res.status(200).json({
    status: 'success',
    data: { stats }
  })
})

export const getMonthlyPlan = catchAsync(async (req, res) => {
  const year = parseInt(req.params.year)

  const plan = await TourModel.aggregate([
    { $unwind: '$startDates' },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        toursCount: { $sum: 1 },
        tours: { $push: '$_id' }
      }
    },
    { $addFields: { month: '$_id' } },
    { $project: { _id: 0 } },
    { $sort: { toursCount: -1 } }
  ])

  res.status(200).json({
    status: 'success',
    data: { plan }
  })
})

export const getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params
  const [lat, lng] = latlng.split(',')

  if (!lat || !lng) {
    return next(new AppError('Please provide latitude and longitude in the lat,lng format.'))
  }

  const earthRadius = unit === 'mi' ? 3963.2 : 6378.1
  const radius = distance / earthRadius

  const tours = await TourModel.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  })

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: { tours }
  })
})

export const getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params
  const [lat, lng] = latlng.split(',')

  if (!lat || !lng) {
    return next(new AppError('Please provide latitude and longitude in the lat,lng format.'))
  }

  const multiplier = unit === 'mi' ? 0.00062137 : 0.001
  const distances = await TourModel.aggregate([
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [lng * 1, lat * 1] },
        distanceField: 'distance',
        distanceMultiplier: multiplier
      }
    },
    {
      $project: {
        name: 1,
        distance: 1
      }
    }
  ])

  res.status(200).json({
    status: 'success',
    results: distances.length,
    data: { distances }
  })
})
