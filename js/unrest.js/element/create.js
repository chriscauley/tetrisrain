import assign from 'lodash'
import riot from 'riot'

export default (tagName,attrs,opts) => {
  const element = document.createElement(tagName);
  if (attrs.parent) {
    if (typeof attrs.parent === 'string') {
      attrs.parent = document.querySelector(attrs.parent)
    }
    attrs.parent.appendChild(element);
    delete attrs.parent;
  }

  assign(element,attrs)

  if (opts) { riot.mount(element,opts); }
  return element;
};