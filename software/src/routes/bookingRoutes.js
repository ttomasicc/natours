import express from 'express'
import * as authController from '../controllers/authController.js'
import * as bookingController from '../controllers/bookingController.js'

const router = express.Router()

router.use(authController.authenticate)

router.get('/checkout-session/:tourId', bookingController.getCheckoutSession)

router.use(authController.authorize('lead-guide', 'admin'))

router.route('/')
  .get(bookingController.getAllBookings)
  .post(bookingController.createBooking)

router.route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking)

export default router
