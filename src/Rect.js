import { getElementPosition } from 'utils'

class Rect {
  constructor ({ top, right, bottom, left }) {
    this.top = top
    this.right = right
    this.bottom = bottom
    this.left = left
    this.width = right - left
    this.height = bottom - top
    this.midpoint = { x: left + this.width / 2, y: top + this.height / 2 }
  }

  containsRect ({ top, right, bottom, left }) {
    return left >= this.left && right <= this.right && top >= this.top && bottom <= this.bottom
  }

  containsPoint ({ x, y }) {
    return x >= this.left && x <= this.right && y >= this.top && y <= this.bottom
  }

  getRelativeAlignment ({ right, bottom, left }) {
    if (left >= this.midpoint.x) {
      return Rect.ALIGNMENT.RIGHT
    }
    if (right <= this.midpoint.x) {
      return Rect.ALIGNMENT.LEFT
    }
    if (bottom <= this.midpoint.y) {
      return Rect.ALIGNMENT.ABOVE
    }
    return Rect.ALIGNMENT.BELOW
  }

  hasSize () {
    return this.height && this.width
  }

  isEqual (rect) {
    if (!rect) {
      return false
    }
    return _.isEqual(
      _.pick(this, 'top', 'right', 'bottom', 'left'),
      _.pick(rect, 'top', 'right', 'bottom', 'left')
    )
  }
}

Rect.fromNode = (node) => new Rect(getElementPosition(node))

Rect.ALIGNMENT = { LEFT: 2, RIGHT: 4, ABOVE: 8, BELOW: 16 }

export default Rect
