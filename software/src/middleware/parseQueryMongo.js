import aqp from 'api-query-params'

const MAX_RESPONSE_LIMIT = parseInt(process.env.MAX_RESPONSE_LIMIT)

export default (req, res, next) => {
  const query = aqp(req.query)

  req.queryMongo = Object.assign(query, {
    pageable: {
      page: query.filter.page || 1,
      limit: Math.min(query.limit, MAX_RESPONSE_LIMIT)
    }
  })

  delete query.filter.page
  delete query.limit

  next()
}
