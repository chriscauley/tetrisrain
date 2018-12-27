import _ from 'lodash'
import { expect } from 'chai'

import auth from '../auth'
import router from '../router'
import { testText } from './utils'

auth.urls.reset = '/dummy/user.json'
auth.urls.register_ajax = '/dummy/register.json'

router.add({
  '#!/auth-t1/': auth.loginRequired(
    router.routeElement('test-tag', { title: 'logged in' }),
  ),
})

export default () => {
  describe('loginRequired', () => {
    it('puts the lotion on the skin', done => {
      auth.ready(() => {
        router.route('#!/auth-t1/')
        expect(!!document.querySelector('ur-auth-start')).to.be.true
        router.route(auth.urls.register) // should fast register
        auth.urls.reset += '-loggedin'
        setTimeout(() => {
          testText('logged in')
          done()
        }, 100)
      })
    })
  })
}
