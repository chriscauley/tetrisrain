import _ from 'lodash'

import _Random from '../index'
const Random = _Random
const range = _.range


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

function showUsage() {
  const random = Random(1234)
  const rows = [
    [() => random(), "A float [0,0.999...]"],
    [() => random.int(), "An int [0,2147483646]"],
    [() => random.int(10), "I'm thinking of a number between 0 and 9"],
    [() => random.int(1,11), "I'm thinking of a number between 1 and 10"],
    [() => random.choice(["heads","tails"]), "Flip a coin!"],
    [() => random.shuffle(range(5)), "Shuffled array, [0-4]"],
    [() => random.reset(), "Reset the PRNG"],
    [() => random(), "Same float as the first row"],
  ]
  return rows.map(([f, description]) => {
    const code = f.toString().split('\n')[1].replace("return ","").replace(";","")
    return [code,(f()||"").toString(),description]
  })
}

function mixedSeeds() {
  const random = Random(1234)
  const random_numbers = []
  const child_prngs = []
  for (let i in range(100)) {
    child_prngs.push(Random(random.getNextSeed()))
    random_numbers.push(random())
  }
  return child_prngs
}

function seedFirst() {
  const random = Random(1234)
  const random_numbers = []
  const child_prngs = []
  for (let i in range(100)) {
    child_prngs.push(Random(random.getNextSeed()))
  }
  for (let i in range(100)) {
    random_numbers.push(random())
  }
  return child_prngs
}

// used to verify that mxedSeeds and seedFirst produce the same results
/*for (let i in range(10)) {
  console.log(mixedSeeds()[i](),seedFirst()[i]())
}*/

const classExample = `
  class Game extends RandomMixin() { }

  class Level extends RandomMixin() {
    constructor(opts) {
      super(opts)
      this.n_enemies = this.random.int(80,90)
      this.enemies = []
      for (let i=0;i<this.n_enemies;i++) {
        this.enemies.push(new Enemy({
          _prng: this
        }))
      }
    }
  }

  // assuming MoveableObject is defined else where...
  class Enemy extends RandomMixin(MoveableObject) { }

  const game = new Game({
    seed: 1234,
  })

  const level = new Level({
    _prng: game,
  })
  level.random()
  level.enemies[0].random()
`

export default {
  makeNthSeries,
  makeDistribution,
  showUsage,
  seedFirst,
  mixedSeeds,
  classExample
}
