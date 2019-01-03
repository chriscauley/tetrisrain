import { extend } from 'lodash'

import router from './router'
import pushState from './pushState'
import resolve from './resolve'

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
  }

  if (path_match) {
    extend(data, { matches: path_match })
    document.body.dataset.ur_path = pathname
    router._routes[path_match.key](pathname, data)
    if (router._stale) {
      window.location.hash = ''
    }
  }
  if (!hash_match && !path_match && router.default_route) {
    router.default_route(pathname)
  }

  pushState(href)
  router._stale = true

  // #! TODO router.do404();

  // #! TODO The following is used for django pages + back button
  // This could paobably be more elegant
  if (router._stale || new_url.href !== old_url.href) {
    // We're not in the single page app, reload if necessary
    // #! TODO window.location = new_url.href
  }
}
