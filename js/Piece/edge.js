import uP from "../pixi"


const getBinaryCombinations = n => {
  const result = []
  const f = (prefix,i) => {
    if (!i) {
      result.push(prefix)
    } else {
      f(prefix.concat([0]),i-1)
      f(prefix.concat([1]),i-1)
    }
  }
  f([],n)
  return result
}

const DIRECTIONS = [
  [0,-1],[0,1],[-1,0],[1,0], //up, down, left, right
]
const DIAGONALS = [
  [1,-1],[1,1],[-1,1],[-1,-1] //ur, dr, dl, ul
]
const colors = ["#000000","#FF0000"]

const makeEdges = square => {
  const sprite = square.sprite
  sprite.children.forEach(s => s.alpha=0)
  uP.cache.edge = {}
  uP.cache.shake = {}
  colors.forEach( (color,ic) => {
    const width = ic?0.15:0.1 // how wide the edge is
    const offset = 1-width // rest of square
    const edge_sprites = DIRECTIONS.concat(DIAGONALS).map( dxdy => (
      uP.sprites.getColor(color, {
        width: dxdy[0]?width:1,
        height: dxdy[1]?width:1,
        y: dxdy[1] > 0 ? offset:0,
        x: dxdy[0] > 0 ? offset:0,
        parent: sprite,
      })
    ))
    getBinaryCombinations(4).forEach( values => {
      const combo = values.map( (value,i) => {
        edge_sprites[i].alpha = value
        return value?1:0
      }).join("")
      const canvas = uP.app.renderer.extract.canvas(square.piece.pixi)
      const cache = ic?'shake':'edge'
      uP.cache[cache][combo] = uP.PIXI.Texture.fromCanvas(canvas)
    })
    edge_sprites.forEach(es => sprite.removeChild(es))
  })
  sprite.children.forEach(s => s.alpha=1)
}

export default {
  makeEdges,
  DIRECTIONS,
  DIAGONALS,
}