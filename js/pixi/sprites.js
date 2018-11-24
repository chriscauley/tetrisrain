import * as PIXI from 'pixi.js'

const color_cache = {}

const getColor = color => {
  if (!color_cache[color]) {
    // cache+clone seems to save 50% time vs new Graphics, 90us to 60us
    let number = color
    if (typeof number === 'string') {
      number = number.split('#').pop()
      number = new Number('0x' + number)
    }
    const graphics = new PIXI.Graphics()
    graphics.beginFill(number, 1)
    graphics.drawRect(0, 0, 1, 1)
    graphics.endFill()
    color_cache[color] = graphics
  }

  const sprite = new PIXI.Sprite()
  sprite.addChild(color_cache[color].clone())
  return sprite
}

const makeGrid = (board, bg_color = 0xffffff, color = 0x888888) => {
  const bg = getColor(bg_color)
  bg.width = board.W * board.scale + 1
  bg.height = board.H * board.scale + 1
  const graphics = new PIXI.Graphics()
  bg.addChild(graphics)

  graphics.lineStyle(1 / bg.width, color, 1)
  for (let x = 0; x < board.W; x++) {
    graphics.moveTo(x / board.W, 0)
    graphics.lineTo(x / board.W, 1)
  }

  graphics.lineStyle(1 / bg.height, color, 1)
  for (let y = 0; y < board.H; y++) {
    graphics.moveTo(0, y / board.H)
    graphics.lineTo(1, y / board.H)
  }

  return bg
}

export default {
  getColor,
  makeGrid,
}
