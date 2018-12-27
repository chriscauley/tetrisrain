import uR from './unrest.js'

import './root.tag'

if (window.GAME) {
  window.location.reload()
} else {
  uR.router.default_route = uR.auth.loginRequired(
    uR.router.routeElement('root'),
  )
}
