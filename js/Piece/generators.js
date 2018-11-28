import _ from 'lodash'
import Piece from './Piece'

Piece.removeNth = n => {
  let i = 0
  const increment = Math.sign(n)
  return s => {
    i += increment
    return !!((i - s.y) % n)
  }
}

Piece.Line = opts => {
  _.defaults(opts, {
    board: 'REQUIRED',
    y: 'REQUIRED',
    remove: Piece.removeNth(opts.board.W),
  })
  opts.squares = _.range(opts.board.W)
    .map(_i => ({
      dx: _i,
      dy: 0,
      board: opts.board,
      y: opts.y,
    }))
    .filter(opts.remove)
  return new Piece(opts)
}
