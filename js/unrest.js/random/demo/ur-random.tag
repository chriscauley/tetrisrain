import _ from "lodash"

import _Random from '../index'
import uR from '../../index'


const binRandom = numbers => {
  const counts = _.range(10).map(_i => 0)
  numbers.forEach(n => counts[Math.floor(n*10)]++)
  return counts
}


const histogram = (datasets,querySelector) => {
  const series = []
  datasets.forEach(data => series.push(binRandom(data)))
  const labels = _.range(10).map(_i => (_i*0.1).toFixed(1))
  var data = { labels, series, }

  var options = {
    height: 400,
  }

  new Chartist.Bar(querySelector, data, options)
}
  

<ur-random>
  <div>
    <h2>First 10 random numbers</h2>
    <p>
      Here are the first 10 numbers of a seeded pseudo random number generator.
      Refresh to verify that they do not change!
    </p>
    <pre><code class="language-js">{ makeFirstTen_string }</code></pre>
  </div>
  <div>
    <h2>Distribution of 10,000 numbers</h2>
    <p>
      This is to verify that the the first 10,000 numbers of the PRNG with seed 456 are uniform.
    </p>
    <pre><code class="language-js">{makeDistribution_string}</code></pre>
    <div id="dist_chart"></div>
  </div>
  <div>
    <h2>Distribution of nth number for 100 PRNGs</h2>
    <p>
      There was <a href="https://gist.github.com/blixt/f17b47c62508be59987b#gistcomment-1272204">a bug</a> in the PRNG this library is based on. The first number is always very small (about 0.04) for the first value if the seed is less than 10,000. To combat this the first value is discarded when the <code class="language-js">Random(SEED)</code> object is initiated.
    </p>
    <p>
      The following shows the 1st, 2nd, 3rd, and 4th value given by a PRNG seeded with a number less than 1,000
    </p>
    <pre><code class="language-js">{makeNthSeries_string}</code></pre>
    <div class="nth-chart chart">
      <div id="nth_chart"></div>
      <div class="legend">
        <div each={ l,i in legends }>
          <span class="series-legend { l }"></span>
          {legend_labels[i]} number
        </div>
      </div>
    </div>
  </div>
<script>
this.legends = "abcd".split("")
this.legend_labels = ['1st','2nd','3rd','4th']

const Random = _Random
const range = _.range

function makeFirstTen() {
  const random = Random(1234);
  return range(10).map(random)
}

this.first_ten = makeFirstTen()

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

for (let f of [makeFirstTen, makeNthSeries, makeDistribution]) {
  this[f.name+"_string"] = f.toString().replace(/\n  /g,'\n')
}

this.on("mount",() => {
  histogram([makeDistribution()],"#dist_chart")
  histogram(makeNthSeries(), "#nth_chart")
})
</script>
</ur-random>

// parcel's HMR doesn't play nice with this page. Hard reload whenever HMR fires.
if (document.querySelector("ur-random")) {
  window.location.reload()
} else {
  uR.element.create("ur-random",{
    parent: document.body,
  },{})
}
