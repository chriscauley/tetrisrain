import { zip } from 'lodash'

const PIECES = {
  t: {
    dxs: [0, 1, -1, 0],
    dys: [0, 0, 0, 1],
    rotations: 4,
  },
  l: {
    dxs: [0, 1, -1, -1],
    dys: [0, 0, 0, 1],
    rotations: 4,
  },
  j: {
    dxs: [0, 1, -1, 1],
    dys: [0, 0, 0, 1],
    rotations: 4,
  },
  z: {
    dxs: [0, -1, 1, 0],
    dys: [0, 0, 1, 1],
    rotations: 2,
  },
  s: {
    dxs: [0, 1, -1, 0],
    dys: [0, 0, 1, 1],
    rotations: 2,
  },
  i: {
    dxs: [0, 1, -1, -2],
    dys: [0, 0, 0, 0],
    rotations: 2,
  },
  o: {
    dxs: [0, 1, 1, 0],
    dys: [0, 0, 1, 1],
    rotations: 0,
  },
}
const _shapes = [undefined, 't', 'l', 'j', 'z', 's', 'i', 'o']
const PIECE_LIST = []

for (const shape in PIECES) {
  const piece = PIECES[shape]
  piece.shape = shape
  PIECE_LIST.push(piece)
  const { dxs, dys } = piece
  piece.squares = zip(dxs, dys).map(
    ([dx, dy]) => ({ dx, dy }), // eg {dx: 1, dy: -1}
  )
}

export default {
  N: 4,
  PIECE_LIST,
  N_TYPES: PIECE_LIST.length,
  PIECES,
  _shapes,
}
