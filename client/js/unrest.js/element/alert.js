// Usage: same as uR.element.create but with defaults:
// riot_opts.ur_modal = true
// attrs.mount_to = uR.element.config.alert_selector
import config from './config'
import create from './create'

//#! TODO since alert and the two config.mount_to values are used in router...
// should this be moved into the router?
// this would also let the create('div',{...}) go in uR.router.ready()
;[config.mount_alerts_to, config.mount_to].forEach(selector => {
  if (!document.querySelector(selector)) {
    create('div', {
      id: selector.replace('#', ''),
      parent: document.body,
    })
  }
})

export default (tagName, attrs, riot_opts) => {
  if (riot_opts) {
    riot_opts.ur_modal = true
  }
  attrs.parent = config.mount_alerts_to
  return create(tagName, attrs, riot_opts)
}
