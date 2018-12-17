/* Usage:
   random = Random(SEED) // seed is an integer or string
   random() // float 0-1
   random.int(N) // int [0,N-1]
   random.int() // int [0,2147483646]
   random.choice(array) // random element from array
   random.shuffle(array) // Returns shuffled array (mutates array)
   random.reset() // returns PRNG to begining
*/

// PRNG algorithm borrowed from https://gist.github.com/blixt/f17b47c62508be59987b
export default seed => {
  // https://stackoverflow.com/a/7616484
  if (typeof seed === 'string') {
    // convert string to integer
    let res = 0
    const len = seed.length
    for (let i = 0; i < len; i++) {
      res = res * 31 + seed.charCodeAt(i)
      res = res & res
    }
    seed = res
  } else if (isNaN(seed)) {
    // seed was neither string or number... pick a truely random seed
    seed = Math.floor(Math.random() * 2147483647)
  }

  let _current
  const random = () => (random.raw() - 1) / 2147483646 // 0-1

  Object.assign(random, {
    seed: seed,
    int: (min = 2147483647, max) => {
      // min-max or 0-min if no max
      if (max === undefined) {
        max = min
        min = 0
      }
      return Math.floor(random() * (max - min) + min)
    },
    raw: () => (_current = (_current * 16807) % 2147483647), // 0-2147483646
    choice: array => array[random.int(array.length)],
    reset: () => {
      _current = seed % 2147483647
      if (_current <= 0) _current += 2147483646
    },
    _getCurrent: () => _current,
    shuffle: array => {
      let i = array.length,
        temp,
        i_rand
      // While there remain elements to shuffle...
      while (0 !== i) {
        // Pick a remaining element...
        i_rand = Math.floor(random() * i)
        i -= 1
        // And swap it with the current element.
        temp = array[i]
        array[i] = array[i_rand]
        array[i_rand] = temp
      }
      return array
    },
  })
  random.reset()

  // for SEED < 10,000 the first number is always ~ 0.01, so let's burn that one
  random()
  return random
}

export const RandomMixin = superclass =>
  class Random extends superclass {
    // creates a method this.random which is a PRNG based on opts._SEED or opts.parent.random
    constructor(opts = {}) {
      super(opts)
      if (opts._prng) {
        // derive seed from a parent PRNG
        this._SEED = opts._prng.random.getNextSeed()
      } else {
        this._SEED = opts._SEED || opts.seed
      }

      this.random = new Random(this._SEED)
    }
  }
