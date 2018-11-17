import riot from 'riot'

export default (tagName, attrs, options) => {
  const element = document.createElement(tagName)
  if (attrs.parent) {
    attrs.parent.appendChild(element)
    delete attrs.parent
  }

  element.innerHTML = attrs.innerHTML || ''
  delete attrs.innerHTML

  for (const attr in attrs) {
    element[attr] = attrs[attr]
  }
  if (options) {
    riot.mount(element, options)
  }
  return element
}
