export class AppError extends Error {
  isOperational = true

  constructor(message, statusCode = 400) {
    super(message)

    this.statusCode = statusCode
    this.status = statusCode.toString().startsWith('4') ? 'fail' : 'error'

    Error.captureStackTrace(this, this.constructor)
  }
}
