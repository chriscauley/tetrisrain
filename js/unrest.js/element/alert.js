// Usage: same as uR.element.create but with defaults:
// riot_opts.ur_modal = true
// attrs.mount_to = uR.element.config.alert_selector
import config from './config'
import create from './create'

export default (tagName, attrs, riot_opts) => {
  if (riot_opts) {
    riot_opts.ur_modal = true
  }
  if (!document.querySelector(config.mount_alerts_to)) {
    create('div', {
      id: config.mount_alerts_to.replace('#', ''),
      parent: document.body,
    })
  }
  attrs.parent = config.mount_alerts_to
  return create(tagName, attrs, riot_opts)
}
