import { inHTMLData } from 'xss-filters'

const _typeof = typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol' ? function(obj) {
  return typeof obj
} : function(obj) {
  return obj && typeof Symbol === 'function' && obj.constructor === Symbol && obj !== Symbol.prototype ? 'symbol' : typeof obj
}

function clean() {
  let data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : ''

  let isObject = false
  if ((typeof data === 'undefined' ? 'undefined' : _typeof(data)) === 'object') {
    data = JSON.stringify(data)
    isObject = true
  }

  data = inHTMLData(data).trim()
  if (isObject) data = JSON.parse(data)

  return data
}

export default () => (req, res, next) => {
  if (req.body) req.body = clean(req.body)
  if (req.query) req.query = clean(req.query)
  if (req.params) req.params = clean(req.params)
  next()
}
