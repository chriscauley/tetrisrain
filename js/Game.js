import _ from 'lodash'

import Board from './Board'
import newCanvas, { Ease } from './newCanvas'
import Controller from './Controller'
import config from './config'
import Piece from './Piece'
import uR from './unrest.js'
import storage from './unrest.js/storage'

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
    actions: [],
  }
  constructor(opts) {
    super(opts)
    this.saved_games = new storage.Storage('saved_games')
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
    // draw floor
    this.floor = this.board.H - current_top / this.scale

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
    for (let i = 0; i < 1; i++) {
      //this.pieces = this.pieces.concat(['z', 'z', 'z', 'z', 'z', 'i'])
      //this.pieces = this.pieces.concat(['i', 'l', 'j', 'o'])
      this.pieces = this.pieces.concat(['t', 't', 't', 't', 't', 'i'])
      //this.pieces = this.pieces.concat(['l', 'j', 'l', 'j', 'i', 'i'])
      //this.pieces = this.pieces.concat(['i','i','i','i'])
      //this.pieces = this.pieces.concat(['l', 'j', 'l', 'j'])
    }

    this.level = 1
    this.speed = this.speed0 = 700
    this.speedK = 60
  }

  reset(id) {
    this.id = id || 'autosave'
    this.current_piece && this.current_piece.removePixi()
    this.current_piece = undefined
    this.swapped_piece = undefined
    this.tags.piece_stash && this.tags.piece_stash.setPieces([], 0)
    this.makeVars()
    this.turn = 0

    this.controller.reset(id)
    this.board.reset()
    this.getPiece()
    this.tags.scores && this.tags.scores.reset()
    this.updatePieceList()
    this.getSkyline()
  }

  replay() {
    this.step = 0
    this.reset()
    this.stepReplay()
  }

  stepReplay = () => {
    if (this.step === this.actions.length) {
      return
    }
    const action = this.actions[this.step]
    this._act[action]()
    this.step++
    setTimeout(this.stepReplay, 75)
  }

  nextTurn() {
    this.getSkyline()
    this.board.removeLines()
    this.board.tickPieces()
    this.turn++
    this.getPiece()
    this.board.draw()
    if (!this.current_piece.check()) {
      this.gameOver()
      return
    }
  }

  save(name) {
    this.saved_games.set(name, this.serialize())
  }

  load(name) {
    const data = this.saved_games.get(name)
    this.deserialize(data)
    this.reset()
    this.replay()
  }

  getSkyline() {
    const old_top = Math.max(this.top, 0)
    this.board.getSkyline()
    if (this.top !== old_top) {
      this.top_from = old_top
      this.animations = [
        { from: old_top, to: this.top, start: new Date().valueOf() },
      ]
    }
  }

  updatePieceList() {
    while (this.pieces.length <= this.turn + this.n_preview + 2) {
      this.pieces.push(config.PIECE_LIST[_.random(config.N_TYPES - 1)].shape)
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
  }

  gameOver() {
    this.reset()
  }

  makeActions() {
    this._act = {
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
        this.current_piece.removePixi()
        if (!this.swapped_piece) {
          this.swapped_piece = this.current_piece
          this.nextTurn()
        } else {
          const old_piece = this.swapped_piece
          this.swapped_piece = this.current_piece
          this.current_piece = old_piece
          this.current_piece.reset()
        }
        this.current_piece.addPixi()
        this.tags.piece_stash.setPieces([this.swapped_piece], 0)
      },
    }
    this.act = {}
    for (const key in this._act) {
      this.act[key] = () => {
        this.actions.push(key)
        this._act[key]()
      }
    }
  }
}
