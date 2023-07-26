import express from 'express'
import * as viewController from '../controllers/viewController.js'
import * as authController from '../controllers/authController.js'
import * as bookingController from '../controllers/bookingController.js'

const router = express.Router()

router.get('/', bookingController.createBookingCheckout, authController.isLoggedIn, viewController.getOverview)
router.get('/login', authController.isLoggedIn, viewController.getLoginForm)
router.get('/signup', viewController.getSignupForm)

router.get('/tour/:slug', authController.isLoggedIn, viewController.getTour)
router.get('/me', authController.authenticate, viewController.getAccount)
router.get('/my-tours', authController.authenticate, viewController.getMyTours)

export default router
