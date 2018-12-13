import _ from 'lodash'

import Board from './Board'
import Controller from './Controller'
import config from './config'
import Piece from './Piece'
import uR from './unrest.js'
import storage from './unrest.js/storage'

import './ui.tag'

export default class Game extends uR.Object {
  static fields = {
    a_level: 1, // determines speed of clock
    b_level: 10, // determines how high up pieces start
    d_level: 0,
    n_preview: 5, // number of pieces visible in preview
    visible_height: 20, // number of lines visible
    pieces: [],
    actions: [],
  }
  constructor(opts) {
    super(opts)
    this.saved_games = new storage.Storage('saved_games')
    this.DEBUG = ~window.location.search.indexOf('debug')
    this.makeVars()
    this.container = document.getElementById('game')

    this.makeActions()
    this.controller = new Controller(this)
    this.board = new Board({ game: this })

    this.reset()
  }

  makeVars() {
    for (let i = 0; i < 1; i++) {
      //this.pieces = this.pieces.concat(['z', 'z', 'z', 'z', 'z', 'i'])
      //this.pieces = this.pieces.concat(['i', 'l', 'j', 'o'])
      //this.pieces = this.pieces.concat(['t', 't', 't', 't', 't', 'i'])
      //this.pieces = this.pieces.concat(['i','i','i','i','i','i','i','i',])
      //this.pieces = this.pieces.concat(['l', 'j', 'l', 'j', 'i', 'i'])
      //this.pieces = this.pieces.concat(['i','i','i','i'])
      this.pieces = this.pieces.concat(['l', 'j', 'l', 'j'])
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
    this.makeVars()
    this.turn = 0

    this.controller.reset(id)
    this.board.reset()
    this.getPiece()
    this.scores && this.scores.reset()
    this.updatePieceList()
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
    this.board.getSkyline()
    this.board.removeLines()
    this.turn++
    this.getPiece()
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
  }

  deserialize(data) {
    super.deserialize(data)
    if (this.board) {
      this.reset()
      this.replay()
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
    return this.pieces[this.turn]
  }

  getPiece(shape = this.updatePieceList()) {
    let y = Math.max(this.board.top - this.b_level, 0)
    y = Math.max(y, this.board.top)
    if (this.current_piece) {
      this.current_piece._is_current = false
    }
    this.current_piece = new Piece({
      x: this.board.W / 2,
      y: y,
      r: 0,
      board: this.board,
      shape,
      _is_current: true,
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
          this.getPiece(old_piece.shape)
        }
        this.current_piece.addPixi()
      },
      shake: () => {
        this.board.shake()
        this.current_piece.redraw()
      },
    }
    this.act = {}
    for (const key in this._act) {
      this.act[key] = () => {
        this.actions.push(key)
        this._act[key]()
        this.root.update()
      }
    }
  }
}
