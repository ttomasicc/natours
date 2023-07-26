import multer from 'multer'
import sharp from 'sharp'
import UserModel from '../models/userModel.js'
import { catchAsync } from '../utils/catchAsync.js'
import * as factory from './handlerFactory.js'
import { AppError } from '../errors/appError.js'

/* IF WE WANT TO USE DISK STORAGE
  const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/img/users')
  },
  filename: (req, file, cb) => {
    const extension = file.mimetype.split('/')[1]
    cb(null, `user-${req.user._id}.${extension}`)
  }
})
*/

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

export const uploadUserPhoto = upload.single('photo')

export const resizeUserPhoto = catchAsync(async (req, res, next) => {
  const { file } = req
  if (!file) return next()

  file.filename = `user-${req.user._id}.jpg`

  await sharp(file.buffer)
    .resize(500, 500)
    .toFormat('jpg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${file.filename}`)

  next()
})

export const getAllUsers = factory.getAll(UserModel, 'users')
export const getUser = factory.getOne(UserModel, 'user')
export const deleteUser = factory.deleteOne(UserModel, 'user')

export const getCurrentUser = (req, res, next) => {
  req.params.id = req.user._id
  next()
}

export const deleteCurrentUser = catchAsync(async (req, res) => {
  const { _id: userId } = req.user

  await UserModel.findByIdAndUpdate(
    userId,
    { active: false },
    { new: true }
  )

  res.status(204).json({
    status: 'success',
    data: null
  })
})

export const updateCurrentUser = catchAsync(async (req, res) => {
  const { _id: id } = req.user

  await updateUserAndSendResponse(id, req, res)
})

export const updateUser = catchAsync(async (req, res) => {
  const { id } = req.params

  await updateUserAndSendResponse(id, req, res)
})

export const createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    data: 'This route does not exist. Please use signup instead.'
  })
}

const updateUserAndSendResponse = async (userId, req, res) => {
  const { name, email } = req.body
  const { file } = req

  const user = await UserModel.findByIdAndUpdate(userId,
    { name, email, ...(file && { photo: file.filename }) },
    { new: true, runValidators: true }
  )

  res.status(200).json({
    status: 'success',
    data: { user }
  })
}
