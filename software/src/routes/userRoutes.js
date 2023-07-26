import express from 'express'
import * as userController from '../controllers/userController.js'
import * as authController from '../controllers/authController.js'
import parseQueryMongo from '../middleware/parseQueryMongo.js'

const router = express.Router()

router.post('/signup', authController.signUp)
router.post('/login', authController.login)
router.get('/logout', authController.logout)

router.post('/forgot-password', authController.forgotPassword)
router.patch('/reset-password/:token', authController.resetPassword)

// restricts to authenticated users
router.use(authController.authenticate)

router.patch('/update-password', authController.updatePassword)

router.route('/current')
  .get(userController.getCurrentUser, userController.getUser)
  .patch(
    userController.uploadUserPhoto,
    userController.resizeUserPhoto,
    userController.updateCurrentUser
  )
  .delete(userController.deleteCurrentUser)

// restricts admin routes
router.use(authController.authorize('admin'))

router.route('/')
  .get(parseQueryMongo, userController.getAllUsers)
  .post(userController.createUser)

router.route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser)

export default router
