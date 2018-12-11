import create from '../element/create'
import config from "./config"

export default {
  init: function(opts) {
    this.theme = config[opts.ur_modal?'modal':'default']
    this.css = config

    if (opts.ur_modal) {
      create('div',{
        onclick: e => this.unmount(),
        className: this.theme.mask,
        parent: this.root,
      })
    }

    this.theme.root && this.theme.root.split(" ").forEach(
      c => this.root.classList.add(c)
    )
  }
}