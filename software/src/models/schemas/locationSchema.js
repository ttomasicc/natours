import mongoose, { Schema } from 'mongoose'

export const startLocationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point'
  },
  coordinates: [Number],
  address: String,
  description: String
}, {
  _id: false
})

export const locationSchema = new Schema({}, {
  _id: true
}).add(startLocationSchema).add({
  day: Number
})
