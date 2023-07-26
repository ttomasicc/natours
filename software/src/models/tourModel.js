import mongoose from 'mongoose'
import validator from 'validator'
import { locationSchema, startLocationSchema } from './schemas/locationSchema.js'

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    minLength: [10, 'A tour name must have more or equal than 10 characters.'],
    maxLength: [40, 'A tour name must have less or equal than 40 characters.'],
    required: [true, 'A tour must have a name.'],
    validate: {
      validator: function(val) {
        return validator.isAlpha(val, 'en-US', { ignore: ' ' })
      },
      message: 'A tour name must only contain characters.'
    }
  },
  slug: {
    type: String,
    unique: true
  },
  duration: {
    type: Number,
    min: [1, 'A tour duration must be above 1.'],
    required: [true, 'A tour must have a duration.']
  },
  maxGroupSize: {
    type: Number,
    min: [1, 'A tour\'s max group size must be above 1.'],
    required: [true, 'A tour must have a group size.']
  },
  difficulty: {
    type: String,
    enum: {
      values: ['easy', 'medium', 'difficult'],
      message: 'Difficulty is either: easy, medium or difficult.'
    },
    required: [true, 'A tour must have a difficulty.']
  },
  ratingsAverage: {
    type: Number,
    default: 0,
    set: (val) => Math.round(val * 10) / 10
  },
  ratingsQuantity: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    min: [0, 'A tour price must be above 0.'],
    required: [true, 'A tour must have a price.']
  },
  priceDiscount: {
    type: Number,
    validate: {
      validator: function(val) {
        return val < this.price
      },
      message: 'Discount price ({VALUE}) should be below the regular price.'
    }
  },
  summary: {
    type: String,
    trim: true,
    required: [true, 'A tour must have a description.']
  },
  description: {
    type: String,
    trim: true
  },
  imageCover: {
    type: String,
    required: [true, 'A tour must have a cover image.']
  },
  images: {
    type: [String]
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  startDates: {
    type: [Date]
  },
  secret: {
    type: Boolean,
    default: false
  },
  startLocation: startLocationSchema,
  locations: [locationSchema],
  guides: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }]
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

tourSchema.index({ startLocation: '2dsphere' })
tourSchema.index({ price: 1, ratingsAverage: -1 })

tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7
})

tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
})

tourSchema.pre('save', function(next) {
  this.slug = this.name.toLowerCase().split(' ').join('-')
  next()
})

tourSchema.pre(/^find/, function(next) {
  this.find({ secret: { $ne: true } }).populate({
    path: 'guides',
    select: '-__v -passwordChangedAt'
  })
  next()
})

tourSchema.pre('aggregate', function(next) {
  const firstAggKey = Object.keys(this.pipeline()[0])[0]
  const insertPosition = firstAggKey === '$geoNear' ? 1 : 0

  this.pipeline().splice(insertPosition, 0, {
    $match: { secretTour: { $ne: true } }
  })

  next()
})

tourSchema.statics.getWhitelistedProperties = () =>
  ['duration', 'price', 'difficulty', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize']

export default mongoose.model('Tour', tourSchema)
