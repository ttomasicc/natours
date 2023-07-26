import { AppError } from './appError.js'

export default (err, req, res, next) => {
  err.statusCode ||= 500
  err.status ||= 'error'

  sendError(err, req, res)
}

const sendError = (err, req, res) => {
  const mode = process.env.NODE_ENV

  if (mode === 'dev') {
    sendErrorDev(err, req, res)
  } else if (mode === 'prod') {
    sendErrorProd(err, req, res)
  }
}

const sendErrorDev = (err, req, res) => {
  res.status(err.statusCode)

  if (req.originalUrl.startsWith('/api')) {
    return res.json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    })
  }

  res.render('error', {
    title: 'Something went wrong...',
    msg: err.message
  })
}

const sendErrorProd = (err, req, res) => {
  const error = handleErrors(err)

  if (error.isOperational) {
    res.status(error.statusCode)

    if (req.originalUrl.startsWith('/api')) {
      return res.json({
        status: error.status,
        message: error.message
      })
    }

    return res.render('error', {
      title: 'Something went wrong...',
      msg: error.message
    })
  }

  console.error(`[ ERROR ] ${new Date()}`, error)

  res.status(500)

  if (req.originalUrl.startsWith('/api')) {
    return res.json({
      status: 'error',
      message: 'Something went wrong.'
    })
  }

  res.render('error', {
    title: 'Something went wrong...',
    msg: 'Please try again later.'
  })
}

const handleErrors = (err) => {
  const error = handleDbErrors(err)
  return handleJwtErrors(error)
}

const handleDbErrors = (err) => {
  if (err.name === 'CastError') {
    return new AppError(`Invalid ${err.path}: ${err.value}.`)
  }

  if (err.name === 'ValidationError') {
    return new AppError(`Invalid data. ${Object.values(err.errors).map((it) =>
      it.name === 'CastError' ? handleDbErrors(it).message : it.message
    ).join('. ')}`)
  }

  if (err.code === 11000) {
    return new AppError(`Duplicate field value: ${Object.keys(err.keyValue)[0]}.`)
  }

  return err
}

const handleJwtErrors = (err) => {
  if (err.name === 'JsonWebTokenError') {
    return new AppError('Invalid token.', 401)
  }

  if (err.name === 'TokenExpiredError') {
    return new AppError('Token has expired.', 401)
  }

  return err
}
