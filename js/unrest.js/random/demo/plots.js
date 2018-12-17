import _ from 'lodash'

import _Random from '../index'
import PRNG from 'prng'
window.PRNG = PRNG

const timeIt = f => {
  const start = new Date().valueOf()
  let i = 1000000
  while (i--) {
    f()
  }
  console.log(f.name, (new Date().valueOf() - start) / 1000)
}

const Random = _Random
const range = _.range

const _PRNG = new PRNG(1000)
const _randy = Random(1000)

setTimeout(() => {
  timeIt(function timeRandom() {
    Random(1000)
  })
  timeIt(function timePRNG() {
    new PRNG(1000)
  })

  timeIt(function getRandom() {
    _randy.int(1000)
  })
  timeIt(function getPRNG() {
    _PRNG.rand(1000)
  })
}, 5000)

function makeFirstTwelve() {
  const random = Random(1234)
  return range(12).map(random)
}

function makeNthSeries() {
  const n_series = 4
  const nth_digits = range(n_series).map(_i => [])
  range(10000).map(() => {
    const r = Random(Math.floor(Math.random() * 1000))
    range(n_series).map(nth => nth_digits[nth].push(r()))
  })
  return nth_digits
}

function makeDistribution() {
  const random456 = Random(456)
  return range(10000).map(random456)
}

export default {
  makeFirstTwelve,
  makeNthSeries,
  makeDistribution,
}
