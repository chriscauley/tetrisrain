import element from '../element'
import router from './router'

export default (element_name, opts = {}) => {
  return (pathname, data) => {
    Object.assign(data, opts)
    const tagName = element_name.toUpperCase()
    const _current = router._current_tag
    const attrs = {
      parent: element.config[data.ur_modal ? 'mount_alerts_to' : 'mount_to'],
      clear: true,
    }
    if (_current && _current.root.tagName === tagName) {
      // #! TODO needs test
      // reuse _current_tag since it matches the desired route
      _current.trigger('route', data)
    } else {
      element.create(element_name, attrs, data)
    }
  }
}
