import express from 'express'
import * as tourController from '../controllers/tourController.js'
import * as authController from '../controllers/authController.js'
import reviewRouter from './reviewRoutes.js'
import parseQueryMongo from '../middleware/parseQueryMongo.js'

const router = express.Router()

router.get(
  '/top-5-cheap',
  parseQueryMongo,
  tourController.aliasTopTours,
  tourController.getAllTours
)
router.get('/stats', tourController.getTourStats)
router.get(
  '/monthly-plan/:year',
  authController.authenticate,
  authController.authorize('admin', 'guide', 'lead-guide'),
  tourController.getMonthlyPlan
)

router.get('/within/:distance/center/:latlng/unit/:unit', tourController.getToursWithin)
router.get('/distances/:latlng/unit/:unit', tourController.getDistances)

router.route('/')
  .get(
    parseQueryMongo,
    tourController.getAllTours
  )
  .post(
    authController.authenticate,
    authController.authorize('admin', 'lead-guide'),
    tourController.createTour
  )

router.route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.authenticate,
    authController.authorize('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour
  )
  .delete(
    authController.authenticate,
    authController.authorize('admin', 'lead-guide'),
    tourController.deleteTour
  )

router.use('/:tourId/reviews', reviewRouter)

export default router
