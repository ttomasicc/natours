import { catchAsync } from '../utils/catchAsync.js'
import ReviewModel from '../models/reviewModel.js'
import { AppError } from '../errors/appError.js'

export const getAllReviews = catchAsync(async (req, res) => {
  const { tourId: tour } = req.params
  const { filter, sort, pageable } = req.queryMongo
  const { page, limit } = pageable

  const reviews = await ReviewModel
    .find({ tour })
    .find(filter)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit) || []

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: { reviews }
  })
})

export const createReview = catchAsync(async (req, res) => {
  const { tourId: tour } = req.params
  const { review: message, rating } = req.body
  const { _id: user } = req.user

  const review = await ReviewModel.create({ review: message, rating, tour, user })

  res.status(201).json({
    status: 'success',
    data: { review }
  })
})

export const updateReview = catchAsync(async (req, res, next) => {
  const { tourId: tour, id } = req.params
  const { review: message, rating } = req.body
  const { _id: user } = req.user

  const review = await ReviewModel.findOneAndUpdate(
    { _id: id, tour, user },
    { review: message, rating },
    { new: true, runValidators: true }
  )

  if (!review) {
    return next(new AppError(`No review found with id '${id}'.`, 404))
  }

  res.status(200).json({
    status: 'success',
    data: { review }
  })
})

export const deleteReview = catchAsync(async (req, res, next) => {
  const { tourId: tour, id } = req.params
  const { _id: user } = req.user

  const deletedReview = await ReviewModel.findOneAndDelete({ _id: id, tour, user })

  if (!deletedReview) {
    return next(new AppError(`No review found with id '${id}'.`, 404))
  }

  res.status(204).json({
    status: 'success',
    data: null
  })
})
