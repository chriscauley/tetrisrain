import { zip } from 'lodash'

export const PIECES = [
  undefined, // empty
  [
    // t
    [[0, 1, -1, 0], [0, 0, 0, 1]],
    [[0, 0, 0, 1], [0, -1, 1, 0]],
    [[0, -1, 1, 0], [0, 0, 0, -1]],
    [[0, 0, 0, -1], [0, 1, -1, 0]],
  ],
  [
    // q
    [[0, 1, -1, -1], [0, 0, 0, 1]],
    [[0, 0, 0, 1], [0, -1, 1, 1]],
    [[0, -1, 1, 1], [0, 0, 0, -1]],
    [[0, 0, 0, -1], [0, 1, -1, -1]],
  ],
  [
    // p
    [[0, 1, -1, 1], [0, 0, 0, 1]],
    [[0, 0, 0, 1], [0, -1, 1, -1]],
    [[0, -1, 1, -1], [0, 0, 0, -1]],
    [[0, 0, 0, -1], [0, 1, -1, 1]],
  ],
  [[[0, -1, 1, 0], [0, 0, 1, 1]], [[0, 0, 1, 1], [0, 1, -1, 0]]], // z
  [[[0, 1, -1, 0], [0, 0, 1, 1]], [[0, 0, 1, 1], [0, -1, 1, 0]]], // s
  [[[0, 1, -1, -2], [0, 0, 0, 0]], [[0, 0, 0, 0], [0, -1, 1, 2]]], // l
  [[[0, 1, 1, 0], [0, 0, 1, 1]]], // o
]

export const _pieces = {}
const _shapes = [undefined, 't', 'l', 'j', 'z', 's', 'i', 'o']

const ROTATIONS = {
  t: 4,
  l: 4,
  j: 4,
  z: 2,
  s: 2,
  i: 2,
  o: 0,
}
PIECES.slice(1).forEach((dxdys, i) => {
  const [dxs, dys] = dxdys[0]
  _pieces[_shapes[i + 1]] = zip(dxs, dys).map(
    ([dx, dy]) => ({ dx, dy }), // eg {dx: 1, dy: -1}
  )
})

export const N_TYPES = PIECES.length - 1

export const N = 4

export default {
  N,
  PIECES,
  ROTATIONS,
  N_TYPES,
  _pieces,
  _shapes,
}
