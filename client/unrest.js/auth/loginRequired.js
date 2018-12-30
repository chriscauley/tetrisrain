import create from '../element/create'
import router from '../router'

import auth from './index'

export default (func, data = {}) => {
  // first argument can be a string to imply we should route directly to a tag
  // #! TODO it would probably be better to do this as a flag on routeElement instead
  // or make a separate shortcut
  if (typeof func === 'string') {
    const tagname = func
    func = (path, data) => create(tagname, data)
  }

  const wrapped = function() {
    const args = arguments
    auth.ready(() => {
      const success = data => {
        if (data) {
          auth.setUser(data.user)
        }
        if (window.location.href.indexOf('/auth/') !== -1) {
          router.clearHash()
        }
        func(...args)
      }
      if (!auth.user || data.force) {
        auth.AUTH_SUCCESS = success
        data.next = window.location.href
        router.route(auth.urls.start, data)
      } else {
        success()
      }
    })
  }
  wrapped.login_required = true
  return wrapped
}
