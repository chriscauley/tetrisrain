import uR from './unrest.js'

import './root.tag'

uR.auth.GREETING = 'Welcome to Tetris Rain!'

uR.router.add({
  '#!/help/': uR.router.routeElement('tr-help'),
})

if (window.GAME) {
  window.location.reload()
} else {
  uR.router.default_route = uR.auth.loginRequired(
    uR.router.routeElement('root'),
  )
}
