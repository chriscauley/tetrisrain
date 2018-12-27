import Ready from '../ready'

const router = {
  _routes: {},
  do404: () => {
    throw 'NotImplemented'
  }, // #! TODO
  MODAL_PREFIX: /^#!/,
  ready: new Ready(),
  add: new_routes => Object.assign(router._routes, new_routes),
}

export default router
