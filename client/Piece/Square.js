import _ from 'lodash'

import uP from '../pixi'
import uR from 'unrest.js'
import edge from './edge'

const { Int, Model } = uR.db

export default class Square extends Model {
  model_name = 'Square'
  app_label = 'main'
  static fields = {
    dx: Int(),
    dy: Int(),
  }
  static opts = {
    piece: uR.REQUIRED,
  }
  constructor(opts) {
    super(opts)
    this._drop = 0 // counter used for moving it down
  }
  validate() {
    if (this.piece.board.get(this.x, this.y) !== this) {
      return false
    }
    return true
  }
  makePixi() {
    this.sprite = uP.sprites.getColor(this.piece.color, {
      width: this.piece.board.scale,
      height: this.piece.board.scale,
      parent: this.piece.pixi,
    })
    if (!uP.cache.edge) {
      edge.makeEdges(this)
    }
    this.sprite.shake = uP.sprites.Sprite({
      parent: this.sprite,
      width: 1,
      height: 1,
      visible: false,
    })
    this.sprite.edge = uP.sprites.Sprite({
      parent: this.sprite,
      width: 1,
      height: 1,
    })
    this.toggleEdge()
  }

  toggleEdge() {
    const combo = edge.DIRECTIONS.map(dxdy => {
      const dx = dxdy[0] + this.dx
      const dy = dxdy[1] + this.dy
      const no_edge = this.piece.squares.find(s => s.dx === dx && s.dy === dy)
      return no_edge ? 0 : 1
    }).join('')
    this.sprite.shake.texture = uP.cache.shake[combo]
    this.sprite.edge.texture = uP.cache.edge[combo]
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
      this.color = '#555555'
      uP.sprites.recolor(this.sprite, this.color)
      this.piece.break_on = this.piece.board.game.turn + 1
      return
    }
    this.piece._needs_split = true
    this.piece.pixi.removeChild(this.sprite) // #A remove squares
    _.remove(this.piece.squares, this)
    this.piece.board.remove(this.x, this.y)
  }
  getColor() {
    return this.color || this.piece.color
  }
  draw(canvas_object, offset_y = 0) {
    canvas_object.drawBox(this.x, this.y - offset_y, 1, 1, this.getColor())
  }
  isNextTo(square) {
    const distance = _.sum(
      [square.dx - this.dx, square.dy - this.dy].map(Math.abs),
    )
    return distance === 1
  }
  getNeighborsAndOrphans(squares) {
    const neighbors = [this]
    _.pull(squares, this)
    for (let i = 0; i < neighbors.length; i++) {
      // match all squares immediately next to neighbors[i] and add them to neighbors
      squares.forEach(test_square => {
        if (test_square.isNextTo(neighbors[i])) {
          neighbors.push(test_square)
        }
      })
      // remove neighbors from squares, turning it into orphans
      _.pullAll(squares, neighbors)
    }
    return [neighbors, squares]
  }
}
