import cookie from 'cookie'
import querystring from 'querystring'
import _ from 'lodash'

const ajax = opts => {
  if (typeof opts === 'string') {
    opts = { url: opts }
  }
  let url = opts.url
  const fetch_opts = {
    method: opts.method || 'GET',
    headers: { 'X-CSRFToken': cookie.parse(document.cookie).csrftoken },
  }
  if (fetch_opts.method === 'GET' && !_.isEmpty(opts.data)) {
    if (url.endswith('?')) {
      url += '?'
    }
    url += querystring.stringify(opts.data)
  } else {
    if (opts.data) {
      fetch_opts.body = JSON.stringify(opts.data)
    }
  }

  return fetch(url, fetch_opts).then(response => response.json())
}

export default ajax
