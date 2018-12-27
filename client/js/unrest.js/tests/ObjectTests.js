import _ from 'lodash'
import { expect } from 'chai'

import uR from '../'

export default () => {
  it('serializes itself to the correct value', () => {
    class OneTwoThree extends uR.Object {
      static fields = {
        one: 1,
        two: 2,
        three: 3,
      }
    }

    const ott = new OneTwoThree()

    expect(ott.serialize()).to.deep.equal({ one: 1, two: 2, three: 3 })
    const new_values = {
      one: 4,
      two: 5,
      three: 6,
    }
    Object.assign(ott, new_values)
    expect(ott.serialize()).to.deep.equal(new_values)
  })

  it('tracks ids independently of classes', () => {
    class A extends uR.Object {}
    class B extends uR.Object {}

    const as = _.range(3).map(_i => new A().id)
    const bs = _.range(3).map(_i => new B().id)
    expect({ a: 1 }).to.deep.equal({ a: 1 })

    expect(as).to.deep.equal([1, 2, 3])
    expect(as).to.deep.equal(bs)
  })

  it('Primitives are converted to proper types', () => {
    const out = {
      i: 1,
      s: 'some string',
    }
    class Explicit extends uR.Object {
      static fields = {
        i: uR.Int(1, { required: true }),
        s: uR.String('some string'),
      }
    }
    class Implicit extends uR.Object {
      static fields = { ...out }
    }
    const exp = new Explicit()
    const imp = new Implicit()
    expect(exp.serialize()).to.deep.equal(imp.serialize())
  })

  it('Validators work', () => {
    class A extends uR.Object {
      static fields = {
        i: 1,
        s: 'some string',
      }
    }

    const fails = [o => (o.i = 'arst'), o => (o.s = 1)]
    fails.forEach(f => {
      const f2 = () => {
        const a = new A()
        f(a)
        a.serialize()
      }
      expect(f2).to.throw()
    })
  })
}
