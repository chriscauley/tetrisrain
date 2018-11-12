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
    }
    const letters = 'abcdefghijklmnopqrstuvwxyz'
    this._action_map = {
      up: 'rotate',
      space: 'drop',
      shift: 'swapPiece',
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
    this._autoplay = setInterval(
      (function(that) {
        let i = 0
        return function() {
          if (
            that._events &&
            that._events[i].time < new Date().valueOf() - that.start
          ) {
            const event = new Event(that._events[i].type)
            event.keyCode = that._events[i].keyCode
            document.dispatchEvent(event)
            i++
            if (!that._events[i]) {
              clearInterval(that._autoplay)
            }
          }
        }
      })(this),
      50,
    )
    if (this.game.DEBUG) {
      this.loadEvents()
    }
  }

  saveEvents() {
    //uR.storage.set("events/"+this.game.id,this.events);
  }

  loadEvents() {
    //this._events = uR.storage.get("events/"+this.game.id);
  }

  record(e, type) {
    if (e.isTrusted && this._autoplay) {
      this._autoplay = clearTimeout(this._autoplay)
    }
    this.events.push({
      keyCode: e.keyCode,
      time: new Date().valueOf() - this.start,
      type: type,
    })
    this.saveEvents()
  }

  reset() {
    this.active = {}
    this.events = []
    this.start = new Date().valueOf()
    clearInterval(this._autoplay)
    // the comment lines on this and onKeyDown and onKeyDown are because it's better to not use the
    // browsers natural key repeat rate. may need to be added back in at some point.
    //for (key in this.timer) { clearTimeout(this.timer[key]) }
    //this.timer = {};
  }

  onKeyDown(e) {
    const event = this._key_map[e.keyCode]
    if (!event) {
      return
    }
    this.active[event] = true
    this.record(e, 'keydown')
    this.action_map[event](e)
    //setTimeOut(function() { this.onKeyDown(e) },initialDelay);
  }

  onKeyUp(e) {
    const event = this._key_map[e.keyCode]
    if (!event) {
      return
    }
    this.active[event] = false
    this.action_up_map[event] && this.action_up_map[event](e)
    this.record(e, 'keyup')
    //clearTimeout(this.timer[e.keyCode]);
  }
}
