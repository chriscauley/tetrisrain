import _ from 'lodash'

import Board from './Board'
import Controller from './Controller'
import Piece from './Piece'
import uR from 'unrest.io'
import Random from 'ur-random'

import './ui.tag'

_.merge(uR.schema.config.name, {
  d_level: {
    choices: _.range(8, 60, 4),
    help_text: 'Number of lines to clear to go to the next level.',
  },
  c_level: { choices: _.range(1, 10) },
  piece_generator: { choices: Piece.GENERATORS },
  //piece_shapes: {
  //  choices: [['ljzstoi', 'all'], 't', 'zszst', 'ljoi', 'oi'],
  //},
  _SEED: {
    choices: [['', 'Random'], 123, 456, 789],
  },
})

const { Int, ForeignKey, APIManager, Model } = uR.db

export const Play = class Play extends Model {
  static app_label = 'main'
  static model_name = 'Play'
  static manager = APIManager
  static fields = {
    actions: [],
    game: ForeignKey('main.Game'),
    id: 0, // #! TODO should be from parent class, or maybe from manager?
    hash: '',
  }
  constructor(opts) {
    super(opts)
    this.piece_count = this.actions.filter(m => m === 'drop').length
  }
}

window.Play = Play

export default class Game extends Random.Mixin(Model) {
  static app_label = 'main'
  static model_name = 'Game'
  static manager = APIManager
  __str__() {
    return this.name || `Game #${this.id}`
  }
  static fields = {
    name: String('', { required: false }),
    a_level: 1, // determines speed of clock (unused)
    b_level: 20, // distance from top before death
    c_level: 3, // number of holes in each line
    d_level: 12, // number of lines in the level
    piece_generator: 'Random', // used to fill up to d_level
    _SEED: Int(undefined, { required: false }),
    piece_shapes: 'ljzstoi',
    shuffle_pieces: false,

    id: 0, // #! TODO should be from parent class, or maybe from manager?
    n_preview: 5, // number of pieces visible in preview
    visible_height: 20, // number of lines visible
  }
  href = `#/game/${this.id}/`
  static editable_fieldnames = [
    'name',
    //'a_level',
    //'b_level',
    'c_level',
    'd_level',
    'piece_generator',
    '_SEED',
    'shuffle_pieces',
    'piece_shapes',
  ]
  constructor(opts) {
    opts = opts || uR.storage.get('GAME_CONFIG')
    super(opts)
    this.actions = []
  }

  play() {
    this.DEBUG = ~window.location.search.indexOf('debug')
    this.makeVars()
    this.container = document.getElementById('game')

    this.makeActions()
    if (window.GAME) {
      window.GAME.controller.bindGame(this)
    } else {
      new Controller(this).bindGame(this)
    }
    this.board = new Board({ game: this })

    this.reset()
    if (!uR.storage.get('help-closed')) {
      uR.router.route('#!/help/')
      uR.storage.set('help-closed', 1)
    }
  }

  makeVars() {
    this.level = 1
    this.speed = this.speed0 = 700
    this.speedK = 60
  }

  reset(id) {
    this.pieces = []
    this.PIECE_SHAPES = this.piece_shapes.split('')
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
    this.tag && this.tag.update()
  }

  replay(replay) {
    this.actions = replay.actions
    this.replaying = replay
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

  deserialize(data) {
    super.deserialize(data)
    data._SEED && this.random && this.random.set(data._SEED) // #! TODO could be in unrest
    if (this.board) {
      this.reset()
      this.replay()
    }
  }

  updatePieceList() {
    while (this.pieces.length <= this.turn + this.n_preview + 2) {
      if (this.shuffle_pieces) {
        this.pieces.push(this.random.choice(this.PIECE_SHAPES))
      } else {
        this.pieces = this.pieces.concat(this.PIECE_SHAPES)
      }
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
      question: () => uR.router.route('#!/help/'),

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
        this.tag.update()
      }
    }
  }
}
