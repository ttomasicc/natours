import express from 'express'
import * as reviewController from '../controllers/reviewController.js'
import * as authController from '../controllers/authController.js'
import parseQueryMongo from '../middleware/parseQueryMongo.js'

const router = express.Router({ mergeParams: true })

router.use(authController.authenticate)

router.route('/')
  .get(parseQueryMongo, reviewController.getAllReviews)
  .post(authController.authorize('user'), reviewController.createReview)

router.route('/:id')
  .patch(authController.authorize('user', 'admin'), reviewController.updateReview)
  .delete(authController.authorize('user', 'admin'), reviewController.deleteReview)

export default router
