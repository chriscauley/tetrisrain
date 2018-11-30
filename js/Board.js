import _ from 'lodash'
import { range, inRange, find, sum } from 'lodash'

import Pallet from './Pallet'
import config from './config'
import uR from './unrest.js'
import uP from './pixi'
import Piece from './Piece'

export default class Board extends uR.Object {
  static fields = {
    W: 10,
    H: 40,
    DEEP: 8,
    pieces: uR.List(Piece),
  }
  static opts = {
    game: uR.REQUIRED,
    scale: 20, // px per block
    pieces: [],
  }
  constructor(opts) {
    super(opts)

    // nested arrays of zeros make up the initial board
    this.squares = range(this.H * this.W).map(() => undefined)
    this.pallet = new Pallet({ board: this })
    this.makePixi()
    this.reset()
    window.B = this
    window.BP = this.pieces
  }

  reset() {
    this.pieces && this.pieces.forEach(p => p.removePixi())
    this.pieces = []
    this.skyline = this.H - 1
    this.top = this.H - this.game.visible_height

    this.squares = this.squares.map(() => undefined)
    _.range(this.game.d_level).forEach(i => {
      const p = Piece.Line({ board: this, y: this.H - i - 1, x: 0 })
      this.pieces.push(p)
      p.set()
    })
  }

  redraw() {
    this.pixi.app.stage.children.forEach(c => c.move())
  }

  getSkyline() {
    const first = find(this.squares) || { y: this.H }
    const game = this.game
    this.skyline = first.y
    this.top = Math.min(
      this.H - game.visible_height,
      this.skyline - game.visible_height + game.b_level,
    )
    this.top = Math.max(this.top, 1)
    game.top = this.top * this.scale
    this.deep_line = this.top + game.visible_height
    this.redraw()
  }

  makePixi = () => {
    this.pixi = new uP.Pixi({
      width: 400,
      height: 600,
      container: '#game',
    })

    this.pixi.board = new uP.PIXI.Container()
    // All of the following are because the container doesn't come from uP.getColo
    this.pixi.board.x = this.game.x_margin
    this.pixi.board.y = this.scale * -this.top
    this.pixi.board.move = () => {
      uP.sprites.easeXY(
        this.pixi.board,
        // TODO move game_margin to board and measure it in units, not px
        this.game.x_margin / this.scale,
        -this.top,
        this.scale,
      )
    }
    this.pixi.app.stage.addChild(this.pixi.board)

    uP.sprites.makeGrid(this, {
      width: this.W * this.scale + 1,
      height: this.H * this.scale,
      parent: this.pixi.board,
    })

    this.pixi.danger_zone = uP.sprites.gradient({
      stops: [
        [0, 'red'],
        [0.2, 'red'],
        [0.2, 'rgba(255,0,0,0.5)'],
        [1, 'rgba(255,0,0,0)'],
      ],
      width: 200,
      height: 200,
      parent: this.pixi.board,
    })

    const line_x = this.game.x_margin / this.scale - 1
    this.pixi.trigger_line = uP.sprites.makeLine(this, '#FF0000', {
      move: () => [line_x, Math.max(this.top, this.game.b_level)],
    })

    this.pixi.b_level = uP.sprites.makeLine(this, '#0000FF', {
      move: () => [line_x, this.game.b_level - this.top + 1],
    })

    this.pixi.floor = uP.sprites.makeLine(this, '#333333', {
      move: () => [line_x, this.H - this.top],
    })

    this.pixi.water = uP.sprites.makeLine(this, '#0000FF', {
      move: () => [0, this.deep_line - this.top],
      x: 0,
      width: this.W * this.scale + this.game.x_margin * 2,
      height: 200,
      alpha: 0.25,
    })

    config.PIECE_LIST.forEach(piece => {
      // this creates style tags for each piece for the preview menu
      const _piece = new Piece({
        board: this,
        shape: piece.shape,
      })
      _piece.removePixi()
    })
  }

  tickPieces() {
    this.pieces.forEach(p => p.tick())
  }

  removeLines(removed_ys = this._getFullYs(), force) {
    this.wipeLines(removed_ys)
    this._removeLines(removed_ys, force)
    _.remove(this.pieces, p => !p.squares.length)
    this.game.getSkyline()
    this.findGoldBars()
    this.detectShake()
  }

  wipeLines(ys) {
    // note, this intentionally triggers for lines that don't actually get removed
    // ie gold lines, deep lines, etc
    ys.forEach(y => {
      const sprite = uP.sprites.getColor('#888888', {
        parent: this.pixi.board,
        y: y * this.scale,
        width: this.scale * this.W,
        height: this.scale,
      })
      uP.sprites.ease(sprite, { alpha: 0 }, 300)
    })
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

      this.scoreLine(y)
      full_ys.push(y)
    }
    return full_ys
  }

  _removeLines(remove_ys, force) {
    const drop_ys = remove_ys.filter(y => {
      // try to remove squares on line
      // certain pieces (gold, deep) may not be removable
      this.getLine(y).map(s => s.kill(force))

      // A line gets dropped if the entire row was successfully removed
      return !this.getLine(y).length
    })
    if (!drop_ys.length) {
      return
    }

    // remove empty pieces from board
    this.pieces = this.pieces.filter(p => p.squares.length)

    // split pieces
    this.pieces.forEach(p => p.checkSplit())

    this.pieces
      .filter(p => p.y < this.deep_line)
      .filter(p => {
        // how far does this piece need to drop?
        const drop = drop_ys.filter(y => y > p.y).length
        if (!drop) {
          return
        }
        p.remove()
        p.y += drop
        return true
      })
      .forEach(p => p.set())
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
        const squares = this.getLine(y)
        if (!squares.length || squares[0].piece.is_gold) {
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
            color: 'FFD700',
            board: this,
            squares,
          })
          piece.is_gold = true
          piece.set()
          reset()
        }
      })
  }
  print() {
    /*eslint-disable */
    //const c = '0123456789abcdefghijklmnopqrstuvwxyz'
    /*for (let y = this.skyline; y < this.H; y++) {
      const squares = this.squares.slice(y * this.W, (y + 1) * this.W)
      const ids = [y, ...squares.map(s => (s ? s.id : ' '))]
      console.log(ids.join(' '))
    }
    console.log('\n')*/
    for (let y = this.skyline; y < this.H; y++) {
      const squares = this.squares.slice(y * this.W, (y + 1) * this.W)
      const ids = [y, ...squares.map(s => (s ? s.piece.id.toString().padStart(2,' ') : '  '))]
      console.log(ids.join(' '))
    }
    console.log('\n\n')
    /*eslint-enable */
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
      throw `Cannot place square in unempty square ${x},${y}`
    }
    this.squares[i] = value
  }
  remove(x, y) {
    this.squares[this._xy2i(x, y)] = undefined
  }

  detectShake() {
    this.pieces.forEach(p => p._can_shake = true)
    this.getLine(this.H-1).forEach(s => s.piece._can_shake = false)
    _.range(this.H,this.skyline-1).forEach(
      y => this.getLine(y).forEach(s => {
        if (!s.piece._can_shake) { return }
        const s2 = this.get(s.x, s.y + 1)
        s.piece._can_shake = !s2 || s2.piece._can_shake
      })
    )

    this.pieces.forEach(p => p.markShake(p._can_shake))
  }
  shake() {
  }
}
