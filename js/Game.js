import _ from 'lodash'

import Board from './Board'
import newCanvas, { Ease } from './newCanvas'
import Controller from './Controller'
import config from './config'
import Piece from './Piece'
import uR from './Object'

import './ui.tag'

export default class Game extends uR.Object {
  static fields = {
    scale: 20, // px per block
    a_level: 1, // determines speed of clock
    b_level: 10, // determines how high up pieces start
    n_preview: 5, // number of pieces visible in preview
    visible_height: 20, // number of lines visible
    x_margin: 100,
    y_margin: 20,
    pieces: [],
    turns: [],
  }
  constructor(opts) {
    super(opts)
    this.DEBUG = ~window.location.search.indexOf('debug')
    this.makeVars()
    this.container = document.getElementById('game')
    this.tags = {}

    this.animation_time = 500

    this.makeActions()
    this.controller = new Controller(this)
    this.board = new Board({ game: this })
    this.makeCanvases()

    this.reset()
    this.board.draw()
    this.tick = this.tick.bind(this)
    this.tick()
    this.DEBUG && this.loadGame(430)
  }

  makeCanvases() {
    this.canvas = newCanvas({
      id: 'game_canvas',
      width: 400,
      height: window.innerHeight,
      parent: this.container,
      scale: this.scale,
    })
    this.animation_canvas = newCanvas({
      width: this.board.W * this.scale + 1,
      height: this.board.H * this.scale + 1,
      scale: this.scale,
    })
  }

  animateLines(lines) {
    if (!lines.length) {
      return
    }
    const ctx = this.animation_canvas.ctx
    ctx.clearRect(
      0,
      0,
      this.animation_canvas.width,
      this.animation_canvas.height,
    )
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    lines.forEach(line_no => {
      ctx.drawImage(
        this.board.canvas,
        0,
        line_no * this.scale, // sx, sy,
        this.board.canvas.width,
        this.scale, // sw, sh,
        0,
        (line_no - this.board.top) * this.scale, // dx, dy,
        this.board.canvas.width,
        this.scale, // dw, dh
      )
      ctx.fillRect(
        0,
        (line_no - this.board.top) * this.scale, // dx, dy,
        this.board.canvas.width,
        this.scale, // dw, dh
      )
    })
    this.animation_opacity = new Ease(250, 1, -1)
  }

  tick() {
    cancelAnimationFrame(this.animation_frame)
    this.draw()
    this.animation_frame = requestAnimationFrame(this.tick)
  }

  draw() {
    this.canvas.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.canvas.ctx.save()
    this.canvas.ctx.translate(this.x_margin, this.y_margin)
    let current_top = this.top
    if (this.animations) {
      const a = this.animations[0]
      const r =
        1 - Math.pow((new Date().valueOf() - a.start) / this.animation_time, 2)
      if (r < 0) {
        this.animations = undefined
      } else {
        current_top = a.to - (a.to - a.from) * r
      }
    }
    // draw grid and floor
    this.floor = this.board.H - current_top / this.scale
    const grid_rows = this.floor
    this.canvas.ctx.drawImage(
      this.board.grid,
      0,
      current_top,
      this.board.grid.width,
      grid_rows * this.scale,
      0,
      0,
      this.board.grid.width,
      grid_rows * this.scale,
    )
    this.canvas.drawBox(
      -0.5,
      this.floor,
      this.board.canvas.width / this.scale + 1,
      4 / this.scale,
      'black',
    )
    this.canvas.drawBox(
      -0.5,
      this.trigger_line,
      this.board.canvas.width / this.scale + 1,
      4 / this.scale,
      'red',
    )
    this.canvas.drawBox(
      -0.5,
      this.b_level - this.board.top + 1,
      this.board.canvas.width / this.scale + 1,
      4 / this.scale,
      'blue',
    )

    // draw board
    this.canvas.ctx.drawImage(
      this.board.canvas,
      0,
      current_top, // sx, sy,
      this.canvas.width,
      this.canvas.height, // sWidth, sHeight,
      0,
      0, // dx, dy,
      this.canvas.width,
      this.canvas.height, // dWidth, dHeight
    )

    // draw water
    this.canvas.drawBox(
      -5,
      this.board.deep_line - this.board.top,
      this.board.W + 10,
      this.canvas.height,
      'rgba(0,0,255,0.25)',
    )

    // animation
    const a_opacity = this.animation_opacity && this.animation_opacity()
    if (a_opacity) {
      this.canvas.ctx.globalAlpha = a_opacity
      this.canvas.ctx.drawImage(this.animation_canvas, 0, 0)
      this.canvas.ctx.globalAlpha = 1
    }

    // draw ghost
    this.canvas.ctx.globalAlpha = 0.5
    this.current_piece.draw(
      this.canvas,
      current_top / this.scale - this.current_piece.ghost_dy,
    )
    this.canvas.ctx.globalAlpha = 1

    // draw piece
    this.current_piece.draw(this.canvas, current_top / this.scale)

    this.canvas.ctx.restore() // remove translates above
  }

  makeVars() {
    this.scale = 20
    this.config = {
      b_level: 10,
      n_preview: 5,
    }
    this.visible_height = 20
    this.x_margin = 100
    this.y_margin = 20
    for (let i = 0; i < 5; i++) {
      //this.pieces = this.pieces.concat(['l','j','i','o'])
      this.pieces = this.pieces.concat(['l', 'j', 'l', 'j', 'i', 'i'])
      //this.pieces = this.pieces.concat(['i','i','i','i'])
      //this.pieces = this.pieces.concat(['l','j','l','j'])
    }

    this.level = 1
    this.speed = this.speed0 = 700
    this.speedK = 60

    this.turns = []
  }

  reset(id) {
    this.id = id || 'autosave'
    this.current_piece = undefined
    this.makeVars()
    this.turn = 0

    this.controller.reset(id)
    this.board.reset(id)
    this.getPiece()
    this.tags.scores && this.tags.scores.reset()
    this.updatePieceList()
    this.getSkyline()
  }

  nextTurn() {
    this.getSkyline()
    this.board.removeLines()
    this.turns.push(_.pick(this.current_piece, ['x', 'y', 'r']))
    this.turn++
    this.getPiece()
    if (!this.current_piece.check()) {
      this.gameOver()
      return
    }
  }

  saveGame(name) {
    localStorage.setItem('game/' + name, JSON.stringify(this.serialize()))
  }

  loadGame(name) {
    const data = JSON.parse(localStorage.getItem('game/' + name))
    this.deserialize(data)
  }

  getSkyline() {
    this.board.getSkyline()

    const old_top = Math.max(this.top, 0)
    let top =
      (this.board.skyline - this.visible_height + this.b_level) *
      this.board.scale
    top = Math.min((this.board.H - this.visible_height) * this.board.scale, top)
    this.trigger_line = Math.max(top / this.scale, this.b_level)
    this.top = Math.max(top, this.scale)
    this.board.top = this.top / this.scale
    this.board.deep_line = this.board.top + this.visible_height
    if (this.top !== old_top) {
      this.top_from = old_top
      this.animations = [
        { from: old_top, to: this.top, start: new Date().valueOf() },
      ]
    }
  }

  updatePieceList() {
    while (this.pieces.length <= this.turn + this.n_preview + 2) {
      const i = Math.floor(config.N_TYPES * Math.random()) + 1
      this.pieces.push(config._shapes[i])
    }
    const visible = this.pieces.slice(
      this.turn + 1,
      this.turn + 1 + this.n_preview,
    )
    const empty = this.n_preview - visible.length
    this.tags.next_piece && this.tags.next_piece.setPieces(visible, empty)
    return this.pieces[this.turn]
  }

  getPiece(shape = this.updatePieceList()) {
    let y = Math.max(this.board.top - this.b_level, 0)
    y = Math.max(y, this.board.top)
    this.current_piece = new Piece({
      x: this.board.W / 2,
      y: y,
      r: 0,
      board: this.board,
      shape,
    })
    this.board.pieces.push(this.current_piece)
  }

  gameOver() {
    this.reset()
  }

  makeActions() {
    this.act = {
      left: () => this.current_piece.moveLeft(),
      right: () => this.current_piece.moveRight(),

      down: () => {
        if (!this.current_piece.moveDown()) {
          this.current_piece.lock()
          this.nextTurn()
        }
      },

      rotate: () => {
        this.current_piece.rotateLeft()
      },

      drop: () => {
        if (!this.current_piece.drop()) {
          this.current_piece.lock()
          this.nextTurn()
        }
      },
      lock: () => {
        this.current_piece.lock()
        this.nextTurn()
      },
      swapPiece: () => {
        if (this.last_swap === this.turn) {
          return
        }
        this.last_swap = this.turn
        if (!this.swapped_piece) {
          this.swapped_piece = this.current_piece
          this.nextTurn()
        } else {
          const old_piece = this.swapped_piece
          this.swapped_piece = this.current_piece
          this.current_piece = old_piece
          this.current_piece.reset()
        }
        this.tags.piece_stash.setPieces([this.swapped_piece], 0)
      },
    }
  }
}
