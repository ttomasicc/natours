import mongoose from 'mongoose'
import validator from 'validator'
import crypto from 'crypto'
import { compare, encrypt } from '../utils/bcryptWrapper.js'

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    maxLength: [70, 'A name name must be less than 70 characters.'],
    required: [true, 'Please tell us your name.']
  },
  email: {
    type: String,
    unique: [true, 'An account with a given email already exists.'],
    lowercase: true,
    validate: [validator.isEmail, 'A given email ({VALUE}) is not valid.'],
    required: [true, 'Please provide your email.']
  },
  photo: {
    type: String,
    default: 'default.jpg'
  },
  password: {
    type: String,
    minLength: [8, 'A password must have at least 8 characters.'],
    required: [true, 'A password is required.'],
    select: false
  },
  passwordConfirm: {
    type: String,
    validate: {
      validator: function(val) {
        return val === this.password
      },
      message: 'The given passwords don\'t match!'
    },
    required: [true, 'A password confirmation is required.']
  },
  passwordChangedAt: {
    type: Date,
    default: Date.now() - 1000
  },
  passwordResetToken: {
    type: String
  },
  passwordResetExpires: {
    type: Date
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user'
  },
  active: {
    type: Boolean,
    default: true,
    select: false
  }
})

userSchema.pre(/^find/, function(next) {
  this.find({ active: true })
  next()
})

userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await encrypt(this.password)
    this.passwordConfirm = undefined
  }
  next()
})

userSchema.pre('save', function(next) {
  if (this.isModified('password') && !this.isNew) {
    this.passwordChangedAt = Date.now() - 1000
  }
  next()
})

userSchema.methods.checkPassword = async function(password) {
  if (!this.password) {
    return false
  }
  return await compare(password, this.password)
}

userSchema.methods.changedPasswordAfter = function(timestamp) {
  return timestamp < parseInt(this.passwordChangedAt.getTime() / 1000)
}

userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex')

  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000

  return resetToken
}

userSchema.methods.deletePasswordResetToken = function() {
  this.passwordResetToken = undefined
  this.passwordResetExpires = undefined
}

export default mongoose.model('User', userSchema)
