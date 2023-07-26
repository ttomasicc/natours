import mongoose from 'mongoose'
import TourModel from './tourModel.js'

const reviewSchema = new mongoose.Schema({
  review: {
    type: String,
    max: [1000, 'A review must be less than 1000 characters.'],
    required: [true, 'A review cannot be empty.']
  },
  rating: {
    type: Number,
    enum: {
      values: [1, 2, 3, 4, 5],
      message: 'A rating must be between 1 and 5.'
    },
    default: 1
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'A review must belong to a tour.']
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'A review must belong to a user.']
  }
})

reviewSchema.index({ tour: 1, user: 1 }, { unique: true })

reviewSchema.statics.calcAverageRating = async function(tourId) {
  const stats = (await this.aggregate([
    { $match: { tour: tourId } },
    {
      $group: {
        _id: '$tour',
        nRatings: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]))[0]

  if (stats) {
    await TourModel.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats.nRatings,
      ratingsAverage: stats.avgRating
    })
  } else {
    await TourModel.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 0
    })
  }
}

reviewSchema.pre(/^find/, function(next) {
  this.populate({ path: 'user', select: 'name photo' })
    .select('-__v')

  next()
})

reviewSchema.post('save', async function() {
  await this.constructor.calcAverageRating(this.tour)
})

reviewSchema.post(/^findOneAnd/, async function(review) {
  if (review) {
    await review.constructor.calcAverageRating(review.tour)
  }
})

export default mongoose.model('Review', reviewSchema)
