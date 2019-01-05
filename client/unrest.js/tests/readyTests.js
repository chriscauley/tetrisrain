import { expect } from 'chai'
import _ from 'lodash'

import uR from '../index'

const events = []
const push = i => () => {
  events.push(i)
}

const custom_ready = new uR.Ready()

uR.ready(push(1))
uR.ready(push(2), push(3))

custom_ready(push(4))
uR.ready(custom_ready.start)
custom_ready(() => {
  uR.ready(push(5))
})

push(0)() // fires before others

export default () => {
  it('pushed the events in the right order', done => {
    uR.ready.then(() => {
      expect(_.isEqual(events, _.range(6))).to.be.true
      done()
    })
  })
}
