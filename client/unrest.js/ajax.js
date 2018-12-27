import querystring from 'querystring'
import _ from 'lodash'

export default opts => {
  if (typeof opts === 'string') {
    opts = { url: opts }
  }
  let url = opts.url
  const fetch_opts = {
    method: opts.method || 'GET',
  }
  if (fetch_opts.method === 'GET' && !_.isEmpty(opts.data)) {
    if (url.endswith('?')) {
      url += '?'
    }
    url += querystring.stringify(opts.data)
  }

  return fetch(url).then(response => response.json())
}
