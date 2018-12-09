import _ from 'lodash'
import * as PIXI from 'pixi.js'
//import Ease from 'pixi-ease'
import sprites from './sprites'
import _layers from 'pixi-layers' // importing this modifies PIXI library
import uR from '../unrest.js'

const uP = (window.uP = {
  ready: new uR.Ready(),
  LAYERS: [],
  PIXI: PIXI,
  sprites,
  cache: {},
})

export default uP

uP.Pixi = (opts={}) => {
  const app = uP.app = new PIXI.Application(_.pick(opts, ['width', 'height']))
  app.stage = new PIXI.display.Stage()
  app.stage.group.enableSort = true
  opts.container &&
    document.querySelector(opts.container).appendChild(app.view)
  return app
}
