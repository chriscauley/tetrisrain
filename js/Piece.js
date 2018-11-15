import _ from 'lodash'
import config from './config'

const uR = {
  REQUIRED: {},
}

const Field = initial => {
  return {
    initial,
    serialize: v => v,
    deserialize: v => v,
  }
}

const List = type => {
  return {
    serialize: list =>
      list.map(item =>
        _.isFunction(item.serialize) ? item.serialize() : item,
      ),
    deserialize: list => list.map(item => new type(item)),
  }
}

const Int = Field
//const String = Field

uR.Object = class {
  //fields = {} // defines the data structure to be serialized
  //opts = {} // non-data initialization options

  constructor(opts) {
    this.makeOpts(opts)
    this.makeFields()
    this.deserialize(opts)
  }

  makeOpts(opts) {
    const base_opts = { ...this.constructor.opts }
    for (const [key, default_value] of Object.entries(base_opts)) {
      this[key] = opts[key] || default_value
    }
  }

  makeFields() {
    this.fields = { ...this.constructor.fields }
  }

  deserialize(json) {
    for (const key in this.fields) {
      const field = this.fields[key]
      const value = _.defaultTo(json[key], field.initial)
      if (field.deserialize) {
        this[key] = field.deserialize(value)
      } else if (typeof field === 'function') {
        // this is not a 100% accurate test for when to use new
        // https://stackoverflow.com/a/40922715
        // maybe check if object is a subclass of uR.Object?
        this[key] = field.prototype
          ? new field(this, value)
          : field(this, value)
      } else {
        this[key] = value
      }
    }
  }

  serialize(keys = this.fields) {
    const json = _.pick(this, keys)
    for (const [key, value] in Object.entries(json)) {
      if (value && value.serialize) {
        json[key] = value.serialize()
      }
    }
    return json
  }
}

export class Square extends uR.Object {
  static fields = {
    dx: Int(),
    dy: Int(),
  }
  static opts = {}
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
  check() {
    // verify that the square is not in an occupied block
    if (!this.piece.board.exists(this.x, this.y)) {
      // off board
      return false
    }
    const square = this.piece.board.get(this.x, this.y)
    return !square || square.piece === this.piece
  }
  kill() {
    _.remove(this.piece.squares, s => s === this)
    this.piece.board.remove(this.x, this.y)
  }
  draw(canvas_object, offset_y = 0) {
    canvas_object.drawBox(
      this.x + 0.25,
      this.y + 0.25 - offset_y,
      0.5,
      0.5,
      'black',
    )
  }
}

export default class Piece extends uR.Object {
  static fields = {
    x: Int(config.WIDTH / 2),
    y: Int(0),
    squares: List(Square),
  }
  static opts = {
    board: uR.REQUIRED,
  }
  constructor(opts) {
    if (typeof opts === 'string') {
      opts = { shape: opts }
    }
    if (!opts.squares && config._pieces[opts.shape]) {
      opts.squares = [...config._pieces[opts.shape]]
    }
    super(opts)
    this.r = 0 // current rotation
    this.max_r = config.ROTATIONS[opts.shape] // 0,2,4 depending on shape
    this.squares.forEach(s => (s.piece = this)) //#! TODO this should be handled as a FK
    this.rotated = 0 // number of times rotated
  }

  rotate(spin) {
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
    if (this.check()) {
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
    this.squares.map(s => {
      this.board.set(s.x, s.y, s)
    })
  }

  _move([dx, dy]) {
    this.x += dx
    this.y += dy
    if (this.check()) {
      return true
    } else {
      this._move([-dx, -dy])
    }
  }

  draw(canvasObject, offset_y = 0) {
    // canvasObject is either board or game
    this.squares.forEach(s => s.draw(canvasObject, offset_y))
  }
}
