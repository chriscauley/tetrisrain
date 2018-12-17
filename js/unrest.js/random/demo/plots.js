import _ from "lodash"

import _Random from '../index'

const Random = _Random
const range = _.range

function makeFirstTen() {
  const random = Random(1234);
  return range(10).map(random)
}

function makeNthSeries() {
  const n_series = 4
  const nth_digits = range(n_series).map(_i=>[])
  range(10000).map(() => {
    const r = Random(Math.floor(Math.random()*1000))
    range(n_series).map( nth => nth_digits[nth].push(r()))
  })
  return nth_digits
}

function makeDistribution() {
  const random456 = Random(456)
  return range(10000).map(random456)
}

export default {
  makeFirstTen,
  makeNthSeries,
  makeDistribution,
}
