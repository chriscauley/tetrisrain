import uR from './Object'
import Ready from './ready'
import element from './element'
import schema from './schema'
import form from './form'
import css from './css'
import router from './router'
import ajax from './ajax'
import auth from './auth'

Object.assign(uR, {
  ready: Ready(),
  Ready,
  element,
  schema,
  form,
  css,
  router,
  ajax,
  auth,
})

uR.ready(() => {
  uR.router.ready.start()
  uR.auth.reset()
})

window.onload = uR.ready.start
window.uR = uR

export default uR
