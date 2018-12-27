// Stops click events from changing the page if caught by unrest router
// Borrowed heavily from riot's router
import route from './route'

export default e => {
  if (
    e.which !== 1 || // not left click
    e.metaKey ||
    e.ctrlKey ||
    e.shiftKey || // or meta keys
    e.defaultPrevented // or default prevented
  )
    return

  let el = e.target
  const loc = window.history.location || window.location

  while (el && el.nodeName !== 'A') el = el.parentNode

  if (
    !el ||
    el.nodeName !== 'A' || // not A tag
    el.hasAttribute('download') || // has download attr
    !el.hasAttribute('href') || // has no href attr
    (el.target && el.target !== '_self') || // another window or frame
    el.href.indexOf(loc.href.match(/^.+?\/\/+[^/]+/)[0]) === -1 // cross origin
  )
    return

  /*if (el.href !== loc.href && (
    el.href.split('#')[0] === loc.href.split('#')[0] // internal jump
    || el.href.startsWith("#") // hash only
    || base[0] !== '#' && getPathFromRoot(el.href).indexOf(base) !== 0 // outside of base
    || base[0] === '#' && el.href.split(base)[0] != loc.href.split(base)[0] // outside of #base
    || !go(getPathFromBase(el.href), el.title || document.title) // route not found
    )) return*/
  e.preventDefault()
  route(el.href)
}
