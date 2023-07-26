import crypto from 'crypto'
import ms from 'ms'
import jwt from 'jsonwebtoken'
import UserModel from '../models/userModel.js'
import { catchAsync } from '../utils/catchAsync.js'
import { AppError } from '../errors/appError.js'
import { Email } from '../utils/email.js'

const signJwt = ({ _id: id }) => new Promise((resolve, reject) => {
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_TIMEOUT,
    issuer: process.env.JWT_ISSUER
  }, (err, token) => err ? reject(err) : resolve(token))
})

const verifyJwt = (token) => new Promise((resolve, reject) => {
  jwt.verify(token, process.env.JWT_SECRET, {
    issuer: process.env.JWT_ISSUER
  }, (err, decoded) => err ? reject(err) : resolve(decoded))
})

const createSendJwt = async (user, req, res, statusCode = 200) => {
  const token = await signJwt(user)

  res.cookie('jwt', token, {
    expires: new Date(Date.now() + ms(process.env.JWT_TIMEOUT)),
    secure: req.secure,
    httpOnly: true
  })

  user.password = undefined
  user.passwordChangedAt = undefined

  res.status(statusCode).json({
    status: 'success',
    token,
    data: { user }
  })
}

export const signUp = catchAsync(async (req, res) => {
  const { name, email, password, passwordConfirm } = req.body

  const user = await UserModel.create({ name, email, password, passwordConfirm })

  await new Email(user, `${req.protocol}://${req.get('host')}/me`).sendWelcome()

  await createSendJwt(user, req, res, 201)
})

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body

  if (!email || !password) {
    return next(new AppError('Please provide email and password.'))
  }

  const user = await UserModel.findOne({ email }).select('+password')

  if (!user || !(await user.checkPassword(password))) {
    return next(new AppError(`Incorrect email or password.`, 401))
  }

  await createSendJwt(user, req, res)
})

export const logout = (req, res) => {
  res.clearCookie('jwt')
  res.status(200).json({
    status: 'success',
    data: null
  })
}

export const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body
  if (!email) {
    return next(new AppError('Please provide an email address.'))
  }

  const user = await UserModel.findOne({ email })

  if (!user) {
    return next(new AppError(`There is no user associated with the provided email address.`, 404))
  }

  const resetToken = user.createPasswordResetToken()
  await user.save({ validateBeforeSave: false })

  const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/reset-password/${resetToken}`
  try {
    await new Email(user, resetUrl).sendPasswordReset()
  } catch (err) {
    user.deletePasswordResetToken()
    await user.save({ validateBeforeSave: false })

    return next(new AppError('Error occurred while sending email.', 500))
  }

  res.status(200).json({
    status: 'success',
    message: 'Token successfully sent.'
  })
})

export const resetPassword = catchAsync(async (req, res, next) => {
  const { token } = req.params
  const { password, passwordConfirm } = req.body

  const passwordResetToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex')

  const user = await UserModel.findOne({
      passwordResetToken,
      passwordResetExpires: { $gt: Date.now() }
    }
  )

  if (!user) {
    return next(new AppError('The token is invalid or has expired.', 400))
  }

  user.password = password
  user.passwordConfirm = passwordConfirm
  user.deletePasswordResetToken()
  await user.save()

  await createSendJwt(user, req, res)
})

export const updatePassword = catchAsync(async (req, res, next) => {
  const { _id: userId } = req.user
  const { currentPassword, newPassword, newPasswordConfirm } = req.body

  if (!currentPassword || !newPassword || !newPasswordConfirm) {
    return next(new AppError('Please provide current password, along with new password and its confirmation.'))
  }

  const user = await UserModel.findById(userId).select('+password')

  if (!(await user.checkPassword(currentPassword))) {
    return next(new AppError('Your current password is wrong.', 401))
  }

  user.password = newPassword
  user.passwordConfirm = newPasswordConfirm
  await user.save()

  await createSendJwt(user, req, res)
})

export const authenticate = catchAsync(async (req, res, next) => {
  const { authorization } = req.headers

  if (authorization && authorization.startsWith('Bearer')) {
    const token = authorization.split(' ')[1]

    if (token) {
      return await authenticateToken(token, req, next)
    }
  } else if (req.cookies.jwt) {
    return await authenticateToken(req.cookies.jwt, req, next)
  }

  next(new AppError('Unauthorized access.', 401))
})

const authenticateToken = async (token, req, next) => {
  const decoded = await verifyJwt(token)
  const currentUser = await UserModel.findById(decoded.id)

  if (currentUser) {
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(new AppError('The given user has changed password.', 401))
    }

    req.user = currentUser
    return next()
  }

  return next(new AppError('The user no longer exists.', 401))
}

export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new AppError('Permission not granted.', 403))
  }
  next()
}

export const isLoggedIn = catchAsync(async (req, res, next) => {
  const token = req.cookies.jwt

  if (token) {
    try {
      const decoded = await verifyJwt(token)
      const currentUser = await UserModel.findById(decoded.id)

      if (currentUser && !currentUser.changedPasswordAfter(decoded.iat)) {
        res.locals.user = currentUser
      }
    } catch (_) {
    }
  }

  next()
})
