import uR from './unrest.js'
import Game from './Game'

import './root.tag'

uR.auth.GREETING = 'Welcome to Tetris Rain!'

uR.router.add({
  '#!/help/': uR.router.routeElement('tr-help'),
  '#!/settings/': uR.router.routeElement('ur-form', {
    model: Game,
    submit: form => {
      uR.storage.set('GAME_CONFIG', form.getData())
      form.unmount()
      uR.router.default_route()
    },
    initial: uR.storage.get('GAME_CONFIG'),
    // #! TODO reset: () => uR.storage.remove("GAME_CONFIG"),
  }),
})

if (window.GAME) {
  window.location.reload()
} else {
  uR.router.default_route = uR.auth.loginRequired(
    uR.router.routeElement('root'),
  )
}
