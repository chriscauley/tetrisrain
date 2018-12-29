import _ from 'lodash'
import Piece from './Piece'

const remove = {
  nth: (board, _slope) => {
    const W = board.W
    const c_level = board.game.c_level
    return s => {
      const start = (_slope * s.y) % W
      const end = (start + c_level) % W
      if (start < end) {
        return s.dx <= start || s.dx > end
      }
      return s.dx > end && s.dx <= start
    }
  },
  random: (board, _slope) => {
    const { W } = board
    const { random, c_level } = board.game
    const places = random.shuffle(_.range(W).map(i => i >= c_level))
    return s => places[s.dx]
  },
}

_.range(30).forEach(y => {
  const s = {
    y,
    dx: 0,
  }
  const B = {
    game: { c_level: 3 },
    W: 10,
  }
  remove.nth(B)(s)
})

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
    .filter(opts.remove(opts.board, 3))
  return new Piece(opts)
}

Piece.Random = opts => Piece.Line({ ...opts, remove: remove.random })

Piece.GENERATORS = ['Line', 'Random']
