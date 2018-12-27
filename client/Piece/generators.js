import _ from 'lodash'
import Piece from './Piece'

const remove = {
  nth: (board, slope) => {
    const W = board.W
    const c_level = board.game.c_level
    let i = 0
    const increment = Math.sign(W)
    return s => {
      i += increment
      return !!(
        Math.floor((i - slope * s.y) / c_level) % Math.floor(W / c_level)
      )
    }
  },
  random: (board, _slope) => {
    const { W } = board
    const { random, c_level } = board.game
    const places = random.shuffle(_.range(W).map(i => i > c_level))
    return s => places[s.dx]
  },
}

Piece.Line = opts => {
  _.defaults(opts, {
    board: 'REQUIRED',
    y: 'REQUIRED',
    remove: remove.nth,
    color: '#333333',
  })
  opts.squares = _.range(opts.board.W)
    .map(_i => ({
      dx: _i,
      dy: 0,
      board: opts.board,
      y: opts.y,
    }))
    .filter(opts.remove(opts.board, 4))
  return new Piece(opts)
}

Piece.Random = opts => Piece.Line({ ...opts, remove: remove.random })

Piece.GENERATORS = ['Line', 'Random']
