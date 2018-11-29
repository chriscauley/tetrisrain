export default class Controller {
  constructor(game) {
    this.game = game
    document.addEventListener('keydown', this.onKeyDown.bind(this))
    document.addEventListener('keyup', this.onKeyUp.bind(this))
    this._key_map = {
      38: 'up',
      40: 'down',
      37: 'left',
      39: 'right',
      32: 'space',
      16: 'shift',
      90: 'z',
    }
    const letters = 'abcdefghijklmnopqrstuvwxyz'
    this._action_map = {
      up: 'rotate',
      space: 'drop',
      shift: 'swapPiece',
      z: 'shake',
    }
    for (let i = 0; i < letters.length; i++) {
      if (this._action_map[letters[i]]) {
        this._key_map[i + 65] = letters[i]
      }
    }
    this.action_up_map = {
      space: 'lock',
    }
    this.action_map = {}
    for (const k in this._key_map) {
      const a = this._key_map[k]
      this.action_map[a] = this.game.act[this._action_map[a] || a]
      if (this.action_up_map[a]) {
        this.action_up_map[a] = this.game.act[this.action_up_map[a]]
      }
    }
    this.reset()
  }

  reset() {
    this.active = {}
    this.events = []
    this.start = new Date().valueOf()
    clearInterval(this._autoplay)
  }

  onKeyDown = e => {
    const event = this._key_map[e.keyCode]
    if (!event || this.active[event]) {
      return
    }
    this.active[event] = true
    this.action_map[event](e)
  }

  onKeyUp = e => {
    const event = this._key_map[e.keyCode]
    if (!event) {
      return
    }
    this.active[event] = false
    this.action_up_map[event] && this.action_up_map[event](e)
  }
}
