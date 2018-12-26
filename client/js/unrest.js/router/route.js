import { extend } from 'lodash'

import router from './router'
import pushState from './pushState'
import resolve from './resolve'

let _is_stale

export default (href, data = {}) => {
  const new_url = new URL(
    href,
    href.match('://') ? undefined : window.location.origin,
  )
  const old_url = new URL(window.location.href)
  const pathname = (new_url.pathname || href).replace(
    window.location.origin,
    '',
  )

  const path_match = resolve(pathname)
  const hash_match = new_url && resolve(new_url.hash)

  if (hash_match) {
    extend(data, {
      matches: hash_match,
      ur_modal: new_url.hash.match(router.MODAL_PREFIX),
      cancel: function() {
        window.location.hash = ''
        this.unmount && this.unmount()
      },
    })
    router._routes[hash_match.key](new_url.hash, data)
  } else if (path_match) {
    extend(data, { matches: path_match })
    document.body.dataset.ur_path = pathname
    router._routes[path_match.key](pathname, data)
    if (_is_stale) {
      window.location.hash = ''
    }
  }
  if (path_match || hash_match) {
    pushState(href)
    _is_stale = true
    return
  } else if (router.default_route) {
    extend(data, { matches: [] })
    router.default_route(pathname, data)
    return
  }
  // #! TODO router.do404();

  // #! TODO The following is used for django pages + back button
  // This could paobably be more elegant
  if (_is_stale || new_url.href !== old_url.href) {
    // We're not in the single page app, reload if necessary
    window.location = new_url.href
  }
  _is_stale = true
  data.one && data.one.route && data.one.route()
  data.on && data.on.route && data.on.route()
}
