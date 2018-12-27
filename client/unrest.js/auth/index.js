import Ready from '../ready'

const auth = {
  ready: Ready(),
  urls: {
    start: '#!/auth/',
    register: '#!/auth/register/',
    login: '#!/auth/login/',
    reset: '/user.json',
    register_ajax: '/api/auth/register/',
    login_ajax: '/api/auth/login/',
  },
}
//#! TODO should routes.add and the urls be in a separate file?
import router from '../router'
import ajax from '../ajax'

auth.ready(() => {
  let register = router.routeElement('ur-auth-register')
  if (auth.FAST_REGISTER) {
    register = () => {
      ajax(auth.urls.register_ajax).then(auth.reset)
    }
  }
  router.add({
    [auth.urls.start + '$']: router.routeElement('ur-auth-start'),
    [auth.urls.login]: router.routeElement('ur-auth-login'),
    [auth.urls.register]: register,
  })
})

export default auth

import _ur_auth from './ur-auth.tag'
import loginRequired from './loginRequired'
import setUser from './setUser'
import reset from './reset'

Object.assign(auth, {
  loginRequired,
  setUser,
  reset,
  enabled: true,
  FAST_REGISTER: true,
})
