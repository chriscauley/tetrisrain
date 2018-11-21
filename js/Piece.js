import _ from 'lodash'
import config from './config'
import uR from './unrest.js'

export class Square extends uR.Object {
  static fields = {
    dx: uR.Int(),
    dy: uR.Int(),
  }
  static opts = {
    piece: uR.REQUIRED,
  }
  constructor(opts) {
    super(opts)
    this._drop = 0 // counter used for moving it down
  }
  get x() {
    return this.dx + this.piece.x
  }
  get y() {
    return this.dy + this.piece.y
  }
  check(f = (x, y) => [x, y]) {
    const [x, y] = f(this.x, this.y)
    // verify that the square is not in an occupied block
    if (!this.piece.board.exists(x, y)) {
      // off board
      return false
    }
    const square = this.piece.board.get(x, y)
    return !square || square.piece === this.piece
  }
  kill(force) {
    // gold pieces don't get eliminated in the normal manner
    if (this.piece.is_gold && !force) {
      this.color = 'grey'
      this.piece.break_on = this.piece.board.game.turn + 1
      return
    }
    _.remove(this.piece.squares, this)
    this.piece.board.remove(this.x, this.y)
  }
  getColor() {
    return this.color || this.piece.color
  }
  draw(canvas_object, offset_y = 0) {
    canvas_object.drawBox(this.x, this.y - offset_y, 1, 1, this.getColor())
  }
}

export default class Piece extends uR.Object {
  static fields = {
    x: uR.Int(),
    y: uR.Int(0),
    squares: uR.List(Square),
  }
  static opts = {
    board: uR.REQUIRED,
    color: 'pink',
    shape: uR.REQUIRED,
  }
  constructor(opts) {
    _.defaults(opts, {
      color: opts.board.pallet[config._shapes.indexOf(opts.shape)],
      x: opts.board.W / 2,
    })
    const template = config.PIECES[opts.shape]
    if (!opts.squares && template) {
      opts.squares = template.squares.map(s => ({
        ...s,
      }))
    }
    super(opts)
    this.r = 0 // current rotation
    this._opts = opts
    this.max_r = template ? template.rotations : 0 // 0,2,4 depending on shape
    this.squares.forEach(s => (s.piece = this)) //#! TODO this should be handled as a FK
    this.board.pieces.push(this)
    this.getGhost()
  }

  reset() {
    this.x = this.board.W / 2
    const y = Math.max(this.board.top - this.board.game.b_level, 0)
    this.y = Math.max(y, this.board.top)
    while (this.r) {
      this.rotate(-Math.sign(this.r), true)
    }
  }

  rotate(spin, force) {
    if (!this.max_r) {
      return
    } // o piece
    this.r += spin
    if (this.r < 0) {
      this.r += this.max_r
    }
    if (this.max_r === 2 && this.r === this.max_r) {
      this.r = 0
      spin = -spin
    }
    this.squares.forEach(square => {
      const { dx, dy } = square
      if (spin > 0) {
        square.dx = dy
        square.dy = -dx
      } else {
        square.dx = -dy
        square.dy = dx
      }
    })
    if (this.check() || force) {
      this.getGhost()
      return true
    } else {
      this.rotate(-spin)
    }
  }
  moveLeft = () => this._move([-1, 0])
  moveRight = () => this._move([1, 0])
  moveUp = () => this._move([0, -1])
  moveDown = () => this._move([0, 1])

  rotateLeft = () => this.rotate(1)
  rotateRight = () => this.rotate(-1)

  check() {
    // verifies that the piece is placed somewhere that it can be
    // Here is where we check the board to see if a piece is blocking a movement
    return _.every(this.squares, s => s.check())
  }

  tick() {
    // currently only used to make gold blocks break after 1 turn of not being used
    if (this.is_gold && this.break_on === this.board.game.turn) {
      const ys = _.range(4).map(dy => this.y + dy)
      this.board.removeLines(ys, true) // forcefully remove these lines
    }
  }

  getGhost() {
    this.ghost_dy = 0
    const check = s => s.check((x, y) => [x, y + this.ghost_dy + 1])
    while (_.every(this.squares, check)) {
      this.ghost_dy++
    }
  }

  drop() {
    let fell = 0
    while (this.moveDown()) {
      fell++
    }
    return fell
  }

  lock() {
    // lock the piece into place on the board
    this.drop()
    this.set()
  }

  set() {
    this.squares.map(s => {
      this.board.set(s.x, s.y, s)
    })
  }

  _move([dx, dy]) {
    this.x += dx
    this.y += dy
    if (this.check()) {
      this.getGhost()
      return true
    } else {
      this._move([-dx, -dy])
    }
  }

  draw(canvasObject, offset_y = 0) {
    // offset_y currently used to make ghost
    this.squares.forEach(s => s.draw(canvasObject, offset_y))
  }
}
