import uR from 'unrest.js'

import './root.tag'

if (window.GAME) {
  window.location.reload()
} else {
  uR.router.default_route = uR.router.routeElement('root')
}
