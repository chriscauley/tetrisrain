import auth from './index'
import riot from 'riot'

export default user => {
  if (!user && !auth.user) {
    return
  } // already logged out
  if (auth.user && user && auth.user.id === user.id) {
    return
  } // already logged in
  // #!TODO storage.set('auth.user',user || null); // JSON.stringify hates undefined
  auth.user = user
  riot.update(auth.tag_names)
}
