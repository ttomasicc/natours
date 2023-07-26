import { catchAsync } from '../utils/catchAsync.js'
import { AppError } from '../errors/appError.js'
import TourModel from '../models/tourModel.js'
import Stripe from 'stripe'
import BookingModel from '../models/bookingModel.js'
import router from '../routes/bookingRoutes.js'
import * as factory from './handlerFactory.js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export const getCheckoutSession = catchAsync(async (req, res, next) => {
  const { tourId } = req.params

  const tour = await TourModel.findById(tourId)

  if (!tour) {
    next(new AppError('Tour not found.'), 404)
  }

  const transformedItems = [{
    quantity: 1,
    price_data: {
      currency: 'eur',
      unit_amount: tour.price * 100,
      product_data: {
        name: `${tour.name} Tour`,
        description: tour.description,
        images: [`${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`]
      }
    }
  }]

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    success_url: `${req.protocol}://${req.get('host')}/?tour=${tourId}&user=${req.user._id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: tourId,
    line_items: transformedItems
  })

  res.status(200).json({
    status: 'success',
    session
  })
})

export const createBookingCheckout = catchAsync(async (req, res, next) => {
  const { tour, user, price } = req.query

  if (!(tour && user && price)) return next()

  await BookingModel.create({ tour, user, price })

  res.redirect(req.originalUrl.split('?')[0])
})

export const getAllBookings = factory.getAll(BookingModel, 'bookings')
export const getBooking = factory.getOne(BookingModel, 'booking')
export const createBooking = factory.createOne(BookingModel, 'booking', (req) => req.body)
export const updateBooking = factory.updateOne(BookingModel, 'booking', (req) => req.body)
export const deleteBooking = factory.deleteOne(BookingModel, 'booking')
