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
})

export default uP

uP.Pixi = class Pixi {
  constructor(opts) {
    this.app = new PIXI.Application(_.pick(opts, ['width', 'height']))
    this.stage = this.app.stage = new PIXI.display.Stage()
    this.stage.group.enableSort = true
    opts.container &&
      document.querySelector(opts.container).appendChild(this.app.view)
  }
}
