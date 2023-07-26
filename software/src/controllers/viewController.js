import TourModel from '../models/tourModel.js'
import { catchAsync } from '../utils/catchAsync.js'
import { AppError } from '../errors/appError.js'
import BookingModel from '../models/bookingModel.js'

export const getOverview = catchAsync(async (req, res) => {
  const tours = await TourModel.find()

  res.status(200).render('overview', {
    title: 'All Tours',
    tours
  })
})

export const getTour = catchAsync(async (req, res, next) => {
  const { slug } = req.params

  const tour = await TourModel.findOne({ slug }).populate({
    path: 'reviews',
    select: 'review rating user'
  })

  if (!tour) {
    return next(new AppError('There is no tour with a given name.'), 404)
  }

  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour
  })
})

export const getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'My Account',
    user: req.user
  })
}

export const getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Login'
  })
}

export const getSignupForm = (req, res) => {
  res.status(200).render('signup', {
    title: 'Sign up'
  })
}

export const getMyTours = catchAsync(async (req, res) => {
  const bookings = await BookingModel.find({ user: req.user._id })
  const tourIds = bookings.map((booking) => booking.tour)
  const tours = await TourModel.find({_id: {$in: tourIds}})

  res.status(200).render('overview', {
    title: 'My tours',
    user: req.user,
    tours
  })
})
