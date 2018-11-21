import { range, inRange, find, sum } from 'lodash'

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
    this.squares = range(this.H * this.W).map(() => undefined)

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

  tickPieces() {
    this.pieces.forEach(p => p.tick())
  }

  removeLines(removed_ys, force) {
    if (!removed_ys) {
      removed_ys = this._getFullYs()
    }

    this.game.animateLines(removed_ys)
    this._removeLines(removed_ys, force)
    this._dropLines()
    this.pieces = this.pieces.filter(p => p.squares.length)
    this.game.getSkyline()
    this.findGoldBars()
    this.draw()
  }

  _getFullYs() {
    const full_ys = []
    for (let y = this.skyline; y < this.H; y++) {
      const squares = this.getLine(y)
      if (squares.length !== this.W) {
        continue
      }

      if (y >= this.deep_line && !squares.find(s => s.piece.is_gold)) {
        this.makeDeep(squares)
        continue
      }

      squares.forEach(s => (s.piece.dirty = true))

      this.scoreLine(y)
      full_ys.push(y)
    }
    return full_ys
  }

  _removeLines(ys, force) {
    ys.forEach(y => {
      this.getLine(y).map(s => s.kill(force))
      if (!this.getLine(y).length) {
        // line has been eliminated, drop everything down
        this.squares
          .slice(0, (y + 1) * this.W)
          .filter(s => s)
          .map(s => s._drop++)
      }
    })
  }

  _dropLines() {
    // after removing lines, lower squaress according to their _drop
    this.squares
      .filter(s => s && s._drop)
      .reverse()
      .forEach(s => {
        this.remove(s.x, s.y)
        s.dy += s._drop
        s._drop = 0
        this.set(s.x, s.y, s)
      })
  }

  makeDeep(squares) {
    if (squares.find(s => s.is_deep)) {
      return
    }
    const piece = new Piece({
      board: this,
      color: this.pallet.DEEP,
      x: 0,
      y: squares[0].y,
      squares: squares.map(s => {
        s.kill()
        return { dx: s.x, dy: 0 }
      }),
    })
    piece.is_deep = true
    piece.set()
  }

  findGoldBars() {
    // post move operations
    let target_y, target_row
    const reset = () => {
      target_y = undefined
      target_row = undefined
    }
    range(this.skyline, this.H)
      .reverse()
      .forEach(y => {
        if (this.getLine(y)[0].piece.is_gold) {
          return
        }
        const row = this.getLine(y, _s => true).map(s => (s ? 1 : 0))
        if (sum(row) !== this.W - 2) {
          return reset() // no missing exactly 2 pieces
        }
        const row_str = row.join('')
        if (row_str.indexOf('00') === -1) {
          return reset() // missing pieces aren't next to each other
        }
        if (!target_row || target_row !== row_str) {
          // first occurrence
          target_row = row_str
          target_y = y
          return
        }
        if (target_y - y === 3) {
          const root_square = this.getLine(y)[0]
          const piece_x = root_square.x
          const piece_y = root_square.y
          const squares = []
          range(y, target_y + 1)
            .map(_y => this.getLine(_y))
            .forEach(line => {
              line.forEach(s => {
                squares.push({ dx: s.x - piece_x, dy: s.y - piece_y })
                s.kill()
              })
            })
          const piece = new Piece({
            x: piece_x,
            y: piece_y,
            color: 'gold',
            board: this,
            squares,
          })
          window.P = piece
          piece.is_gold = true
          piece.set()
          reset()
        }
      })
  }
  print() {
    for (let y = this.skyline; y < this.H; y++) {
      const squares = this.squares.slice(y * this.W, (y + 1) * this.W)
      console.log([y,...squares.map(s=>s?1:' ')].join(' ')) // eslint-disable-line
    }
  }

  scoreLine(y) {
    // maybe just move this logic to the scores tag?
    if (this.get(0, y).piece.is_deep) {
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
  getLine(y, filter = s => s) {
    return this.squares.slice(y * this.W, (y + 1) * this.W).filter(filter)
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
