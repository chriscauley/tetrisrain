import _ from 'lodash'
import { expect } from 'chai'

import router from './index'
import _tt from './_test_tags.tag'

window.location.hash = '#'

const ROUTES = {
  '#!/foo': router.routeElement('test-tag', { title: 'foo' }),
  '#!/bar': router.routeElement('test-tag', { title: 'bar' }),
  '#!/click': router.routeElement('test-tag', { title: 'click' }),
}

router.add(ROUTES)

const testText = s =>
  expect(document.querySelector('test-tag').innerText.trim()).to.equal(s)

describe('uR.router', () => {
  it('has the right number of routes', () => {
    for (const key in ROUTES) {
      expect(router._routes[key]).to.be.a('function')
    }
  })

  it('Loads the right content for each test tag in the right place', () => {
    router.route('#!/foo')
    testText('foo')
    router.route('#!/bar')
    testText('bar')

    // because these all start with uR.router.MODAL_PREFIX, they should be in ur-alerts
    expect(!!document.querySelector("#ur-alerts test-tag")).to.be.true
  })

  it('loads the right tag when the link is clicked', () => {
    const a = document.createElement('a')
    a.href = '#!/click'
    document.querySelector('#ur-content').appendChild(a)
    a.click()
    testText('click')
  })
})
