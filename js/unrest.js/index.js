import uR from './Object'
import Ready from './ready'
import element from './element'

Object.assign(uR, {
  ready: Ready(),
  Ready,
  element,
})

window.onload = uR.ready.start
window.uR = uR

export default uR
