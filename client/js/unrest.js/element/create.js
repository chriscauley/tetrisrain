// Usage uR.element.create("my-tag",attrs,options)
// element = <attrs.parent><my-tag {...attrs}></attrs.parent>
// options && riot.mount(element,options)

import riot from 'riot'

export default (tagName, attrs, riot_opts) => {
  const element = document.createElement(tagName)
  if (attrs.parent) {
    if (typeof attrs.parent === 'string') {
      attrs.parent = document.querySelector(attrs.parent)
    }
    attrs.parent.appendChild(element)
    delete attrs.parent
  }

  Object.assign(element, attrs)

  if (riot_opts) {
    riot.mount(element, riot_opts)
  }
  return element
}
