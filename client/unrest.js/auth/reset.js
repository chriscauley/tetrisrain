import auth from './index'
import ajax from '../ajax'

export default () => {
  if (!auth.enabled) {
    return
  }
  auth.setUser() // removes current user
  return ajax({
    url: auth.urls.reset, // #! TODO should be configurable
  }).then(data => {
    auth.setUser(data.user)
    auth.ready.start()
    if (auth.user && auth.AUTH_SUCCESS) {
      auth.AUTH_SUCCESS()
      auth.AUTH_SUCCESS = undefined
    }
  })
}
