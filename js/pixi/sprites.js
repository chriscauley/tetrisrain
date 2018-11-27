import _ from 'lodash'
import * as PIXI from 'pixi.js'
import Ease from 'pixi-ease'

const color_cache = {}

const ease_list = new Ease.list()

const easeXY = (obj, x, y, scale, time = 250) => {
  ease_list.add(
    new Ease.to(
      obj,
      {
        x: scale * x,
        y: scale * y,
      },
      time,
    ),
  )
}

const _Sprite = opts => {
  const sprite = new PIXI.Sprite()
  _.assign(
    sprite,
    _.pick(opts, [
      'x',
      'y', // PIXI.js
      'width',
      'height', // PIXI.js
      'alpha', // PIXI.js
    ]),
  )
  opts.parent && opts.parent.addChild(sprite)
  if (opts.move) {
    const _move = () => {
      const [x, y] = opts.move()
      easeXY(sprite, x, y, opts.scale)
    }
    sprite.move = () => {
      const [x, y] = opts.move()
      sprite.move = _move
      sprite.x = opts.scale * x
      sprite.y = opts.scale * y
    }
  }
  return sprite
}

const _getColor = color => {
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
  return color_cache[color]
}

const getColor = (color, opts = {}) => {
  const sprite = new _Sprite(opts)
  sprite._color = _getColor(color).clone()
  sprite.addChild(sprite._color)
  return sprite
}

const recolor = (sprite, color) => {
  sprite.removeChild(sprite._color)
  sprite._color = _getColor(color).clone()
  sprite.addChild(sprite._color)
}

const makeLine = (board, color, opts = {}) => {
  _.defaults(opts, {
    width: (board.W + 2) * board.scale,
    height: 3,
    x: board.game.x_margin - board.scale,
    parent: board.pixi.app.stage,
    scale: board.scale,
  })
  return getColor(color, opts)
}

const makeGrid = (board, opts) => {
  _.defaults(opts, {
    bg_color: 0xffffff,
    color: 0x888888,
    scale: board.scale,
  })
  const bg = getColor(opts.bg_color, opts)
  const graphics = new PIXI.Graphics()
  bg.addChild(graphics)

  graphics.lineStyle(1 / bg.width, opts.color, 1)
  for (let x = 0; x < board.W + 1; x++) {
    graphics.moveTo(x / board.W, 0)
    graphics.lineTo(x / board.W, 1)
  }

  graphics.lineStyle(1 / bg.height, opts.color, 1)
  for (let y = 0; y < board.H; y++) {
    graphics.moveTo(0, y / board.H)
    graphics.lineTo(1, y / board.H)
  }

  return bg
}

export default {
  getColor,
  recolor,
  makeGrid,
  makeLine,
  easeXY,
}
