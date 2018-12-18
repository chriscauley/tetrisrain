import _ from 'lodash'
import create from '../element/create'
import config from './config'

export default {
  init: function(opts) {
    this.css = _.cloneDeep(config)
    this.theme = this.css[opts.ur_modal ? 'modal' : 'default']

    if (opts.ur_modal) {
      create('div', {
        onclick: () => this.unmount(),
        className: this.theme.mask,
        parent: this.root,
      })
    }

    this.theme.root &&
      this.theme.root.split(' ').forEach(c => this.root.classList.add(c))
  },
}
