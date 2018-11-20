import { range, inRange, every, find } from 'lodash'

import Pallet from './Pallet'
import newCanvas, { drawLine } from './newCanvas'
import newElement from './newElement'
import config from './config'
import uR from './unrest.js'
import Piece from './Piece'

export default class Board extends uR.Object {
  static fields = {
    W: 10,
    H: 30,
    DEEP: 8,
    pieces: uR.List(Piece),
  }
  static opts = {
    game: uR.REQUIRED,
    pieces: [],
  }
  constructor(opts) {
    super(opts)
    this.scale = this.game.scale
    this.reset()

    this.pallet = new Pallet({ board: this })
    this.makeCanvas()
  }

  reset() {
    this.pieces = []
    this.skyline = this.H - 1
    this.top = this.H - this.game.visible_height

    // nested arrays of zeros make up the initial board
    this.squares = range(this.H * this.W).map(() => 0)

    //!# TODO this isn't wiping the board...
    this.canvas &&
      this.canvas.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }

  draw() {
    this.canvas.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.squares.forEach(s => s && s.draw(this.canvas))
  }

  getSkyline() {
    const first = find(this.squares) || { y: this.H }
    this.skyline = first.y
  }

  makeCanvas() {
    const attrs = {
      id: 'board',
      width: this.W * this.scale + 1,
      height: this.H * this.scale + 1,
      parent: this.game.DEBUG && document.getElementById('debug'),
      scale: this.scale,
    }
    this.canvas = newCanvas(attrs)

    attrs.id = 'grid-img'
    this.grid = newElement('img', attrs)
    // this.game.DEBUG && document.getElementById("debug").appendChild(this.grid);

    // gradient on grid
    this.gradient = this.canvas.ctx.createLinearGradient(
      0,
      0,
      0,
      this.canvas.height,
    )
    this.gradient.addColorStop(0, 'red')
    this.gradient.addColorStop(2 / this.H, 'red')
    this.gradient.addColorStop(2 / this.H, '#faa')
    this.gradient.addColorStop(0.5, '#fff')
    this.gradient.addColorStop(1, '#fff')
    this.canvas.ctx.fillStyle = this.gradient
    this.canvas.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    // make grid
    for (let i = 0; i <= this.W; i++) {
      drawLine(
        this.canvas.ctx,
        i * this.scale,
        0,
        i * this.scale,
        this.canvas.height,
        this.pallet.border,
      )
    }
    for (let i = 0; i <= this.H; i++) {
      drawLine(
        this.canvas.ctx,
        0,
        i * this.scale,
        this.canvas.width,
        i * this.scale,
        this.pallet.border,
      )
    }
    this.grid.src = this.canvas.toDataURL()
    this.canvas.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    // make pieces
    this.small_canvas = newCanvas({
      width: config.N * this.scale + 1,
      height: config.N * this.scale + 1,
      scale: this.scale,
    })
    this.imgs = {}
    let style = ''
    const piece_div = document.createElement('div')
    config.PIECE_LIST.forEach((piece, n) => {
      const w = this.small_canvas.width
      const h = this.small_canvas.height

      // cycle through rotations
      this.small_canvas.ctx.clearRect(0, 0, w, h)
      piece.squares.forEach(square => {
        // draw 4 boxes
        this.small_canvas.ctx.fillStyle = this.pallet[n + 1]
        this.small_canvas.ctx.fillRect(
          (2 + square.dx) * this.scale,
          (1 + square.dy) * this.scale,
          this.scale,
          this.scale,
        )
      })

      const img = document.createElement('img')
      img.src = this.small_canvas.toDataURL()
      piece_div.appendChild(img)
      // style tag for showing pieces in html elements (piece-list)
      const bg = `background-image: url(${img.src});`
      style += `piece-stack .p${piece.shape}:before { ${bg} }\n`
    })
    this.game.DEBUG && document.querySelector('#debug').appendChild(piece_div)
    newElement('style', {
      parent: document.head,
      innerHTML: style,
      type: 'text/css',
    })
  }

  removeLines() {
    const _lines = []
    for (let y = this.skyline; y < this.H; y++) {
      const squares = this.squares.slice(y * this.W, (y + 1) * this.W)
      if (!every(squares)) {
        continue
      }

      if (y >= this.deep_line) {
        // make row DEEP
        !squares[0].is_deep && squares.forEach(s => s.markDeep())
        continue
      }

      this.scoreLine(y)
      _lines.push(y)
    }

    this.game.animateLines(_lines)
    _lines.forEach(y => {
      for (let x = 0; x < this.W; x++) {
        this.get(x, y).kill()
      } // set top to zero
      this.squares
        .slice(0, (y + 1) * this.W)
        .filter(s => s)
        .map(s => s._drop++)
      this.skyline++
    })
    this.squares
      .filter(s => s && s._drop)
      .reverse()
      .forEach(s => {
        this.remove(s.x, s.y)
        s.dy += s._drop
        s._drop = 0
        this.set(s.x, s.y, s)
      })
    this.pieces = this.pieces.filter(p => p.squares.length)
    this.draw()
    this.game.getSkyline()
  }
  print() {
    for (let y = this.skyline; y < this.H; y++) {
      const squares = this.squares.slice(y * this.W, (y + 1) * this.W)
      console.log([y,...squares.map(s=>s?1:' ')].join(' ')) // eslint-disable-line
    }
  }

  scoreLine(y) {
    // maybe just move this logic to the scores tag?
    if (this.get(0, y).is_deep) {
      this.game.scores.add('deep')
    } else {
      this.game.scores.add('lines')
    }
  }
  exists(x, y) {
    return inRange(x, 0, this.W) && inRange(y, 0, this.H)
  }
  _xy2i = (x, y) => x + y * this.W
  get(x, y) {
    if (x > this.W) {
      return
    }
    return this.squares[this._xy2i(x, y)]
  }
  set(x, y, value) {
    const i = this._xy2i(x, y)
    if (this.squares[i]) {
      throw 'Cannot place square in unempty square'
    }
    this.squares[i] = value
  }
  remove(x, y) {
    this.squares[this._xy2i(x, y)] = undefined
  }
}
