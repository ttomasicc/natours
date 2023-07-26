import { readFileSync } from 'fs'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'
import TourModel from '../../src/models/tourModel.js'
import UserModel from '../../src/models/userModel.js'
import ReviewModel from '../../src/models/reviewModel.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const tours = JSON.parse(readFileSync(`${__dirname}/tours.json`, 'utf-8'))
const users = JSON.parse(readFileSync(`${__dirname}/users.json`, 'utf-8'))
const reviews = JSON.parse(readFileSync(`${__dirname}/reviews.json`, 'utf-8'))

try {
  await mongoose.connect(process.env.MONGO_URI)
  console.info('MongoDB state:\tconnected!')
} catch (err) {
  console.error(err)
  process.exit(1)
}

try {
  console.info('Cleaning database...')
  await TourModel.deleteMany()
  await UserModel.deleteMany()
  await ReviewModel.deleteMany()
  console.info('Cleaning done!')
} catch (err) {
  console.error(`Error deleting: ${err}`)
  process.exit(1)
}

try {
  console.info('Inserting demo data...')
  await TourModel.create(tours)
  console.info('\t+ model: tours')
  await UserModel.create(users, { validateBeforeSave: false })
  console.info('\t+ model: users')
  await ReviewModel.create(reviews)
  console.info('\t+ model: reviews')
  console.info('Insertion done!')
} catch (err) {
  console.error(`Error importing: ${err}`)
  process.exit(1)
}

await mongoose.disconnect()
