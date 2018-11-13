import riot from 'riot'

import Game from './Game'
import './root.tag'

riot.mount('root')
window.GAME = new Game()
