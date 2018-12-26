import uR from './Object'
import Ready from './ready'
import element from './element'
import schema from './schema'
import form from './form'
import css from './css'
import router from './router'

Object.assign(uR, {
  ready: Ready(),
  Ready,
  element,
  schema,
  form,
  css,
  router,
})

uR.ready(() => uR.router.ready.start())

window.onload = uR.ready.start
window.uR = uR

export default uR
