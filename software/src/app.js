import express from 'express'
import rateLimit from 'express-rate-limit'
import mongoSanitize from 'express-mongo-sanitize'
import morgan from 'morgan'
import * as path from 'path'
import { fileURLToPath } from 'url'
import ms from 'ms'
import hpp from 'hpp'
import helmet from 'helmet'
import xss from './middleware/xssClean.js'
import cookieParser from 'cookie-parser'
import compression from 'compression'

import tourRouter from './routes/tourRoutes.js'
import userRouter from './routes/userRoutes.js'
import bookingRouter from './routes/bookingRoutes.js'
import viewRouter from './routes/viewRoutes.js'
import { AppError } from './errors/appError.js'
import errorHandler from './errors/errorHandler.js'
import TourModel from './models/tourModel.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()

// sets pug as the view engine
app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname, '..', 'public')))

// sets secure HTTP response headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      'script-src': ['\'self\'', 'https://unpkg.com/', 'https://js.stripe.com/'],
      'img-src': ['\'self\'', 'blob:', 'data:', 'https:'],
      'frame-src': ['\'self\'', 'https://js.stripe.com/']
    }
  }
}))

// sets API request limit
app.use('/api', rateLimit({
  max: process.env.REQUESTS_LIMIT,
  windowMs: ms(process.env.REQUESTS_LIMIT_WINDOW),
  message: `Too many requests, please try again in ${ms(ms(process.env.REQUESTS_LIMIT_WINDOW), { long: true })}`
}))

// parses request body
app.use(express.json({ limit: '10kb' }))

// parses cookies
app.use(cookieParser())

// sanitizes data against nosql query injection
app.use(mongoSanitize())

// sanitizes data against xss attacks (aqp loses less than capability)
app.use(xss())

// removes parameter pollution
app.use(hpp({
  whitelist: TourModel.getWhitelistedProperties()
}))

if (process.env.NODE_ENV === 'dev') {
  // adds HTTP request logger
  app.use(morgan('dev'))
}

// compresses text outputs
app.use(compression())

// adds view rendering
app.use('/', viewRouter)

// adds resource routers
app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/bookings', bookingRouter)

// matches unknown paths
app.all('*', (req, res, next) => {
  next(new AppError(`Not found: ${req.originalUrl}.`, 404))
})

// adds global error handler
app.use(errorHandler)

export default app
