import onClick from './onClick'
import route from './route'
import routeElement from './routeElement'
import router from './router'

Object.assign(router, {
  route,
  routeElement,
})

router.ready(() => {
  document.addEventListener('click', onClick)

  // if router has not been activated, trigger for current location
  !router._stale && router.route(window.location.href)
})

export default router
