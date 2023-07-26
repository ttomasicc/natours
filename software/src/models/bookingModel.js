import mongoose from 'mongoose'

const bookingSchema = new mongoose.Schema({
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'A booking must have a tour.']
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'A booking must have a user.']
  },
  price: {
    type: Number,
    required: [true, 'A booking must have a price.']
  },
  paid: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

bookingSchema.index({ tour: 1, user: 1 }, { unique: true })

bookingSchema.pre(/^find/, function(next) {
  this.populate({ path: 'tour', select: 'name' })
    .populate({ path: 'user' })

  next()
})

export default mongoose.model('Booking', bookingSchema)
