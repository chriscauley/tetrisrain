import _ from 'lodash'
import * as PIXI from 'pixi.js'
//import Ease from 'pixi-ease'
import sprites from './sprites'
import _layers from 'pixi-layers' // importing this modifies PIXI library
import animation from './animation'
import uR from 'unrest.js'

const uP = (window.uP = {
  ready: new uR.Ready(),
  LAYERS: [],
  PIXI: PIXI,
  sprites,
  cache: {},
  ANIMATION_TIME: 250,
})

export default uP

uP.Pixi = (opts = {}) => {
  uP.scale = opts.scale
  const app = (uP.app = new PIXI.Application(_.pick(opts, ['width', 'height'])))
  animation(uP)
  app.stage = new PIXI.display.Stage()
  app.stage.group.enableSort = true
  opts.container && document.querySelector(opts.container).appendChild(app.view)
  return app
}
