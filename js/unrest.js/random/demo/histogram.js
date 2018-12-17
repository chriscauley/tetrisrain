import _ from "lodash"

const binRandom = numbers => {
  const counts = _.range(10).map(_i => 0)
  numbers.forEach(n => counts[Math.floor(n*10)]++)
  return counts
}

export default (datasets,querySelector) => {
  const series = []
  datasets.forEach(data => series.push(binRandom(data)))
  const labels = _.range(10).map(_i => (_i*0.1).toFixed(1))
  var data = { labels, series, }

  var options = {
    height: 400,
  }

  new Chartist.Bar(querySelector, data, options)
}