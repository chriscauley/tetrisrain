import _ from 'lodash'
import { expect } from 'chai'

import router from './index'
import _tt from './_test_tags.tag'

window.location.hash = '#'

const ROUTES = {
  '#!/foo$': router.routeElement('test-tag', { title: 'foo' }),
  '#!/bar': router.routeElement('test-tag', { title: 'bar' }),
  '#!/click': router.routeElement('test-tag', { title: 'click' }),
}

router.add(ROUTES)

const testText = s =>
  expect(document.querySelector('test-tag').innerText).to.equal(s)

describe('uR.router', () => {
  it('has the right number of routes', () => {
    for (const key in ROUTES) {
      expect(router._routes[key]).to.be.a('function')
    }
  })

  it('loads the right content for each test tag', () => {
    router.route('#!/foo')
    testText('foo')
    router.route('#!/bar')
    testText('bar')
  })

  it('loads the right tag when the link is clicked', () => {
    const a = document.createElement('a')
    a.href = '#!/click'
    document.querySelector('#ur-content').appendChild(a)
    a.click()
    testText('click')
  })
})
