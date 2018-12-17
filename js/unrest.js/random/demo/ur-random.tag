import _ from "lodash"

import _Random from '../index'
import uR from '../../index'
import histogram from './histogram'
import plots from './plots'

<ur-random>
  <section>
    <h2>Usage: <code class="language-js">function Random</code></h2>
    <p>
      A new PRNG with seed 1234 would be instantiated with <code class="language-js">const random = Random(1234)</code>. The result is a function that returns a float between 0 and 0.999... (in order to match the api of <code class="language-js">Math.random()</code>).
    </p>
    <p>
      The function also has several built in functions:
    </p>
    <table class="table table-striped">
      <thead>
        <th>Code</th>
        <th class="hide-sm">Result</th>
        <th>Description</th>
      <tr each={ row,i in usage_rows }>
        <td>
          <code class="language-js">{row[0]}</code>
        </td>
        <td class="hide-sm">{row[1]}</td>
        <td>{row[2]}</td>
      </tr>
    </table>
  </section>
  <section>
    <h2>Usage: <code class="language-js">Random(SEED).getNextSeed()</code></h2>
    <p>
      The impetus behind this library was to use a seeded PRNG to make a video game replayable but chaotic. With one PRNG for the whole game, the butterfly effect takes over, and killing a character or ending a level one turn early can drastically alter everything controlled by the PRNG down the line. To avoid this, the PRNG has a second stream of randomness accessible via <code class="language-js">random.getNextSeed()</code>. In short, both of the following have the same results:
    </p>
    <div class="columns">
      <div class={col}>
        <pre><code class="language-js">{ mixedSeeds_string }</code></pre>
      </div>
      <div class={col}>
        <pre><code class="language-js">{ seedFirst_string }</code></pre>
      </div>
    </div>
  </section>
  <section>
    <h2>Usage: <code class="language-js">class RandomMixin</code></h2>
    <p>
      This is an ES6 mixin to easily create classes that have access to a PRNG ala <code class="language-js">this.random</code> and can create children with their own PRNG seeded by the parent class. So, for example, a game could have a seed, which generates levels, which generate enemies, which move randomly and drop random items. Note that <code class="language-js">RandomMixin</code> can be used with or without a parent class as it's first argument defaults to JavaScript's built in Object.
    </p>
    <div class="columns">
      <div class={col}>
        <pre><code class="language-js">{classExample_string}</code></pre>
      </div>
    </div>
  </section>
  <section class="distribution">
    <h2>Test: Distribution of numbers</h2>
    <p>
      This is to verify that the the first 10,000 numbers of <code class="language-js">Random(456)</code> form a nearly uniform distribution. I might make this more rigorous in the future when I add formal tests.
    </p>
    <div class="columns">
      <div class={col}>
        <pre><code class="language-js">{makeDistribution_string}</code></pre>
      </div>
      <div class={col}>
        <div id="dist_chart"></div>
      </div>
    </div>
  </section>
  <section>
    <h2>Test: Distribution of nth number</h2>
    <p>
      There was <a href="https://gist.github.com/blixt/f17b47c62508be59987b#gistcomment-1272204">a bug</a> in the PRNG this library is based on. The first number was always very small (about 0.04) for the first value if the seed was small (less than 10,000). To combat this the first value is discarded when the <code class="language-js">Random(SEED)</code> object is initiated.
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
  </section>
<script>
this.col = "column col-6 col-md-12"
this.legends = "abcd".split("")
this.legend_labels = ['1st','2nd','3rd','4th']

const Random = _Random
const range = _.range

window.R = Random

for (let key in plots ) {
  this[key+"_string"] = plots[key].toString()
}
this.usage_rows = plots.showUsage()

this.on("mount",() => {
  histogram([plots.makeDistribution()],"#dist_chart")
  histogram(plots.makeNthSeries(), "#nth_chart")
})
</script>
</ur-random>

// Hard reload whenever parcel's HMR fires (it doesn't play nice with this page).
if (document.querySelector("ur-random")) {
  window.location.reload()
} else {
  uR.element.create("ur-random",{
    parent: document.querySelector("#content"),
  },{})
}
