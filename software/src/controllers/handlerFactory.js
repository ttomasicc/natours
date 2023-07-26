import { catchAsync } from '../utils/catchAsync.js'
import { AppError } from '../errors/appError.js'

export const getOne = (Model, resource, populateOpts) =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params

    let query = Model.findById(id)
    if (populateOpts) query.populate(populateOpts)

    const document = await query

    if (!document) {
      return next(new AppError(`No ${resource} found with id '${id}'.`, 404))
    }

    res.status(200).json({
      status: 'success',
      data: { [`${resource}`]: document }
    })
  })

export const getAll = (Model, resource) =>
  catchAsync(async (req, res) => {
    const { filter, sort, pageable } = req.queryMongo
    const { page, limit } = pageable

    const documents = await Model
      .find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit) || []

    res.status(200).json({
      status: 'success',
      results: documents.length,
      data: { [`${resource}`]: documents }
    })
  })

export const createOne = (Model, resource, fn) =>
  catchAsync(async (req, res) => {
    const document = await Model.create(fn(req))

    res.status(201).json({
      status: 'success',
      data: { [`${resource}`]: document }
    })
  })

export const updateOne = (Model, resource, fn) =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params

    const document = await Model.findByIdAndUpdate(id, fn(req), { new: true, runValidators: true })

    if (!document) {
      return next(new AppError(`No ${resource} found with id '${id}'.`, 404))
    }

    res.status(200).json({
      status: 'success',
      data: { [`${resource}`]: document }
    })
  })

export const deleteOne = (Model, resource) =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params

    const document = await Model.findByIdAndDelete(id)

    if (!document) {
      return next(new AppError(`No ${resource} found with id '${id}'.`, 404))
    }

    res.status(204).json({
      status: 'success',
      data: null
    })
  })
