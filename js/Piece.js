import { defaultTo, pick, isFunction } from 'lodash'
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
      list.map(item => (isFunction(item.serialize) ? item.serialize() : item)),
    deserialize: list => list.map(item => new type(item)),
  }
}

const Int = Field
//const String = Field

uR.Object = class {
  //fields = {} // defines the data structure to be serialized
  //opts = {} // non-data initialization options

  constructor(initial, opts) {
    this.makeOpts(opts)
    this.makeFields()
    this.deserialize(initial)
  }

  makeOpts(opts) {
    const base_opts = { ...this.constructor.opts, ...opts }
    for (const [key, value] in Object.entries(base_opts)) {
      this[key] = value
    }
  }

  makeFields() {
    this.fields = { ...this.constructor.fields }
  }

  deserialize(json) {
    for (const key in this.fields) {
      const field = this.fields[key]
      const value = defaultTo(json[key], field.initial)
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
    const json = pick(this, keys)
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
  get x() {
    return this.dx + this.piece.x
  }
  get y() {
    return this.dy + this.piece.y
  }
}

export default class Piece extends uR.Object {
  static fields = {
    x: Int(config.WIDTH / 2),
    y: Int(0),
    squares: List(Square),
  }
  constructor(initial, opts) {
    if (typeof initial === 'string') {
      initial = { shape: initial }
    }
    if (!initial.squares && config._pieces[initial.shape]) {
      initial.squares = [...config._pieces[initial.shape]]
    }
    super(initial, opts)
    this.squares.forEach(s => (s.piece = this)) //#! TODO this should be handled as a FK
  }
  eachSquare(f) {
    this.squares.forEach(f)
  }
  remove() {
    // take the piece off the board so it can be moved or rotated
    this.board.f
  }
  rotateLeft() {
    //
  }
}
