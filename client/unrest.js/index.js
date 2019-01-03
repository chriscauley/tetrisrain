import uR from './Object'
import Ready from './ready'
import element from './element'
import schema from './schema'
import form from './form'
import css from './css'
import router from './router'
import ajax from './ajax'
import auth from './auth'
import storage from './storage'
import db from './db'

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
  storage,
  db,
})

uR.ready(() => {
  uR.db.ready.start()
  uR.db.ready(() => {
    uR.auth.reset()
    uR.router.ready.start()
  })
})

window.onload = uR.ready.start
window.uR = uR

export default uR
