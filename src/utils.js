const getBodyScrollPosition = () => {
  const body = document.body
  const docEl = document.documentElement
  return {
    top: window.pageYOffset || docEl.scrollTop || body.scrollTop,
    left: window.pageXOffset || docEl.scrollLeft || body.scrollLeft,
  }
}

// adapted and es6ified from http://stackoverflow.com/a/26230989/26836
export const getElementPosition = (elem) => {
  if (!elem) {
    return {}
  }
  const box = elem.getBoundingClientRect()
  const { top: scrollTop, left: scrollLeft } = getBodyScrollPosition()
  const body = document.body
  const docEl = document.documentElement
  const clientTop = docEl.clientTop || body.clientTop || 0
  const clientLeft = docEl.clientLeft || body.clientLeft || 0
  const top = Math.round(box.top + scrollTop - clientTop)
  const left = Math.round(box.left + scrollLeft - clientLeft)
  const bottom = Math.round(top + box.height)
  const right = Math.round(left + box.width)
  return { top, left, bottom, right }
}

const supportsTouch =
  'ontouchstart' in window ||
  window.DocumentTouch && document instanceof window.DocumentTouch ||
  navigator.maxTouchPoints > 0 ||
  window.navigator.msMaxTouchPoints > 0

// Since the hover media feature is somewhat unreliable, we use touch support
// as the indicator. If a browser supports touch, we prefer that over hover
// (and if it doesnt support touch, it must support hover). This means we never
// support both, which is a trade-off to be aware of.
export const canHover = !supportsTouch
