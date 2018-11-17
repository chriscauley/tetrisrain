// http://paletton.com/#uid=70R1r0kt+lZlOstrKqzzSiaJidt

export default class Pallet {
  constructor(options) {
    this.board = options.board
    const defaults = {
      colors: [
        ['#AF720B', '#E3AA48', '#D4901C', '#915B00', '#6B4400'],
        ['#7AA50A', '#AED644', '#98C81B', '#638900', '#496500'],
        ['#86085D', '#AD3787', '#A21574', '#6F004A', '#520037'],
        ['#113974', '#395E96', '#1D4A8C', '#082B5F', '#041F47'],
      ],
      border: '#cccccc',
      bg: 'white',
      fg: '#333',
    }
    defaults.DEEP = '#222'
    for (const key in defaults) {
      this[key] = options[key] || defaults[key]
    }
    for (let i = 0; i < 7; i++) {
      const shade = Math.floor(i / this.colors.length) * 3
      this[i + 1] = this.colors[i % this.colors.length][shade]
    }
  }
}
