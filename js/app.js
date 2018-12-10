import riot from 'riot'

import './root.tag'

if (window.GAME) {
  window.location.reload()
} else {
  riot.mount('root')
}
