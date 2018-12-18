import _ from 'lodash'

import Board from './Board'
import Controller from './Controller'
import config from './config'
import Piece from './Piece'
import uR from './unrest.js'
import Random from 'ur-random'
import storage from './unrest.js/storage'

import './ui.tag'

_.merge(uR.schema.config.name, {
  d_level: { choices: _.range(5, 30, 5) },
  c_level: { choices: _.range(1, 10) },
  piece_generator: { choices: Piece.GENERATORS },
})

export default class Game extends Random.Mixin(uR.Object) {
  static fields = {
    a_level: 1, // determines speed of clock (unused)
    b_level: 20, // distance from top before death
    c_level: 3, // number of holes in each line
    d_level: 10, // number of lines in the level
    piece_generator: 'Random', // used to fill up to d_level
    _SEED: uR.Int(),

    n_preview: 5, // number of pieces visible in preview
    visible_height: 20, // number of lines visible
    pieces: [],
    actions: [],
  }
  static editable_fieldnames = [
    'a_level',
    'b_level',
    'd_level',
    'piece_generator',
    '_SEED',
  ]
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
    // uR.element.alert('ur-form',{},{object: this})
  }

  makeVars() {
    for (let i = 0; i < 1; i++) {
      //this.pieces = this.pieces.concat(['z', 'z', 'z', 'z', 'z', 'i'])
      //this.pieces = this.pieces.concat(['i', 'l', 'j', 'o'])
      this.pieces = this.pieces.concat(['t', 't', 't', 't', 't', 'i'])
      //this.pieces = this.pieces.concat(['i','i','i','i','i','i','i','i',])
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
      this.pieces.push(config.PIECE_LIST[this.random.int(config.N_TYPES)].shape)
    }
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
