import uR from 'unrest.io'
import Game, { Play } from './Game'

import './tags'
import './routes'

uR.auth.GREETING = 'Welcome to Tetris Rain!'
uR.ready(() => {
  Game.__makeMeta()
  Play.__makeMeta()
})

uR.router.default_route = uR.auth.loginRequired(() =>
  uR.router.route('#!/settings/'),
)

if (window.HMR) {
  window.location.reload()
}
window.HMR = true
