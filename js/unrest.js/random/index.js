// This provides a wrapper around Math.random for a few common functions, as well as an interface to tap into a seeded RNG in order to run unit tests on anything using randomness.

// PRNG borrowed from https://gist.github.com/blixt/f17b47c62508be59987b
export default (seed) => {
  var _seed;

  // https://stackoverflow.com/a/7616484
  if (typeof seed == "string") { // convert string to integer
    var res = 0, len = seed.length;
    for (var i = 0; i < len; i++) {
      res = res * 31 + seed.charCodeAt(i);
      res = res & res;
    }
    seed = res;
  }

  // #! TODO see _analyzeRandom
  // uR._random_seeds[seed] = (uR._random_seeds[seed] || 0) + 1;
  const random = () => (random.raw() - 1) / 2147483646; // 0-1

  Object.assign(random,{
    int: (min,max) => {
      // min-max or 0-min if no max
      return (max === undefined)?random.int(0,min):Math.floor(random()*(max-min)+min);
    },
    raw: () => _seed = _seed * 16807 % 2147483647, // 0-2147483646
    choice: (array) => array[random.int(array.length)],
    reset: () =>  {
      _seed = seed % 2147483647;
      if (_seed <= 0) _seed += 2147483646;
    },
    seed: seed,
    getSeed: () => _seed,
    getNextSeed: () => {
      return random.raw()%8191;// 2^13-1...because why not?
    },
  })
  random.reset();
  if (isNaN(_seed)) { // seed was neither string or number... pick a truely random seed
    random.raw = () => Math.floor(Math.random()*2147483647);
  }

  random.shuffle = (array) => {
    var i = array.length, temp, i_rand;
    // While there remain elements to shuffle...
    while (0 !== i) {
      // Pick a remaining element...
      i_rand = Math.floor(random() * i);
      i -= 1;
      // And swap it with the current element.
      temp = array[i];
      array[i] = array[i_rand];
      array[i_rand] = temp;
    }
    return array;
  };

  // the first number is always ~ 0.01, so let's burn that one
  random()
  return random;
};

export const RandomMixin = superclass => class Random extends superclass {
  // creates a method this.random which is a PRNG based on opts._SEED or opts.parent.random
  constructor(opts={}) {
    super(opts);
    this._SEED = opts._SEED || opts.seed;
    if (opts._prng) { this._SEED = opts._prng.random.getNextSeed(); }
    this.random = new uR.Random(this._SEED);
  }
};
