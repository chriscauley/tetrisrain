import _ from 'lodash'
import Piece from './Piece'

const remove = {
  nth: (W,gap,slope) => {
    let i = 0
    const increment = Math.sign(W)
    return s => {
      i += increment
      return !!(Math.floor((i - slope*s.y)/gap) % Math.floor(W/gap))
    }
  },
  random: (W,gaps,slope) => {
    const places = _.shuffle(_.range(W).map(i => i > gaps))
    return s => places[s.dx]
  }
}

Piece.Line = opts => {
  _.defaults(opts, {
    board: 'REQUIRED',
    y: 'REQUIRED',
    remove: remove.nth,
    color: "#333333",
  })
  opts.squares = _.range(opts.board.W)
    .map(_i => ({
      dx: _i,
      dy: 0,
      board: opts.board,
      y: opts.y,
    }))
    .filter(opts.remove(opts.board.W,opts.board.game.c_level,4))
  return new Piece(opts)
}

Piece.Random = opts => Piece.Line({...opts, remove: remove.random })

Piece.GENERATORS = ["Line","Random"]
