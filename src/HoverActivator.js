import Rect from 'Rect'
import { canHover } from 'utils'

const DELAY = 300
const MOUSE_LOCS_TRACKED = 5
const slope = (a, b) => (b.y - a.y) / (b.x - a.x)

class HoverActivator extends React.Component {
  constructor (props) {
    super(props)
    autobind(this, 'handleMouseMove', 'handleTargetHoverChange', 'handleSourceHoverChange', 'maybeDeactivate')
  }

  isEnabled () {
    return this.props.isEnabled && canHover
  }

  componentWillMount () {
    if (this.isEnabled()) {
      this.startListening()
    }
  }

  componentWillUnmount () {
    this.stopListening()
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.isEnabled !== nextProps.isEnabled) {
      if (nextProps.isEnabled && canHover) {
        this.startListening()
      } else {
        this.stopListening()
      }
    }
  }

  clearTimers () {
    clearTimeout(this.activateTimer)
    clearTimeout(this.deactivateTimer)
    clearTimeout(this.leaveTargetTimer)
    this.logDebug('timers cleared')
  }

  startListening () {
    this.stopListening()
    this.mouseLocs = []
    this.lastDelayedActivateLoc = null
    this.lastDelayedDeactivateLoc = null
    document.addEventListener('mousemove', this.handleMouseMove)
    this.logDebug('started')
  }

  stopListening () {
    this.logDebug('stopped')
    document.removeEventListener('mousemove', this.handleMouseMove)
    this.clearTimers()
  }

  handleMouseMove (evt) {
    if (!this.isEnabled()) {
      return
    }
    this.mouseLocs.push({ x: evt.pageX, y: evt.pageY })
    if (this.mouseLocs.length > MOUSE_LOCS_TRACKED) {
      this.mouseLocs.shift()
    }
  }

  handleTargetHoverChange (hovering) {
    if (!this.isEnabled()) {
      return
    }
    if (hovering) {
      this.logDebug('target enter')
      this.clearTimers()
    } else {
      this.logDebug('target leave')
      this.leaveTargetTimer = _.delay(this.props.onActiveKeyChange.bind(this, null), DELAY)
    }
  }

  handleSourceHoverChange (hovering, key = true) {
    if (!this.isEnabled()) {
      return
    }
    clearTimeout(this.deactivateTimer)
    if (hovering) {
      this.logDebug('source enter')
      clearTimeout(this.activateTimer)
      clearTimeout(this.leaveTargetTimer)
      this.maybeActivate(key)
    } else {
      this.logDebug('source leave')
      this.maybeDeactivate()
    }
  }

  maybeActivate (key = true) {
    const delay = this.getActivationDelay()
    if (delay) {
      this.logDebug(`delay activating '${key}'`)
      this.activateTimer = _.delay(this.maybeActivate.bind(this, key), delay)
    } else {
      this.logDebug(`activate '${key}'`)
      this.props.onActiveKeyChange(key)
    }
  }

  getActivationDelay () {
    if (!this.props.getActiveKey() || !this.props.targetRect) {
      this.logDebug('no activeKey or targetRect')
      return 0
    }
    const loc = _.last(this.mouseLocs)
    if (!loc || _.isEqual(loc, this.lastDelayedActivateLoc)) {
      this.logDebug('no loc or didnt move')
      return 0
    }
    const prevLoc = _.first(this.mouseLocs) || loc
    if (this.isMovingTowardsTarget(loc, prevLoc)) {
      this.logDebug('moving towards target')
      this.lastDelayedActivateLoc = loc
      return DELAY
    }
    this.lastDelayedActivateLoc = null
    return 0
  }

  maybeDeactivate () {
    const delay = this.getDeactivateDelay()
    if (delay > 0) {
      this.logDebug('delay deactivating')
      this.deactivateTimer = _.delay(this.maybeDeactivate, delay)
    } else if (!delay) {
      this.logDebug('deactivate')
      this.props.onActiveKeyChange(null)
    }
  }

  getDeactivateDelay () {
    const loc = _.last(this.mouseLocs)
    if (!loc || !this.props.targetRect) {
      this.logDebug('no loc or targetRect')
      return 0
    }
    const isOverTarget = this.props.targetRect.containsPoint(loc)
    if (_.isEqual(loc, this.lastDelayedDeactivateLoc)) {
      this.logDebug('didnt move')
      return isOverTarget ? -1 : 0
    }
    const prevLoc = _.first(this.mouseLocs) || loc
    if (this.isMovingTowardsTarget(loc, prevLoc)) {
      this.logDebug('moving towards target')
      this.lastDelayedDeactivateLoc = loc
      return DELAY
    }
    this.lastDelayedDeactivateLoc = null
    return isOverTarget ? -1 : 0
  }

  isMovingTowardsTarget (loc, prevLoc) {
    const { top, right, bottom, left } = this.props.targetRect
    const { inc, dec } = {
      [Rect.ALIGNMENT.RIGHT]: { dec: { x: left, y: top }, inc: { x: left, y: bottom } },
      [Rect.ALIGNMENT.LEFT]: { dec: { x: right, y: bottom }, inc: { x: right, y: top } },
      [Rect.ALIGNMENT.ABOVE]: { dec: { x: left, y: bottom }, inc: { x: right, y: bottom } },
      [Rect.ALIGNMENT.BELOW]: { dec: { x: right, y: top }, inc: { x: left, y: top } },
    }[this.props.targetAlignment]
    return slope(loc, dec) < slope(prevLoc, dec) && slope(loc, inc) > slope(prevLoc, inc)
  }

  render () {
    return this.props.children(_.pick(this, 'handleSourceHoverChange', 'handleTargetHoverChange'))
  }

  logDebug (msg) {
    if (this.props.debugId) {
      console.log(this.props.debugId, msg)
    }
  }
}

HoverActivator.propTypes = {
  children: React.PropTypes.func.isRequired,
  getActiveKey: React.PropTypes.func.isRequired,
  isEnabled: React.PropTypes.bool,
  onActiveKeyChange: React.PropTypes.func.isRequired,
  targetAlignment: React.PropTypes.oneOf(_.values(Rect.ALIGNMENT)),
  targetRect: React.PropTypes.instanceOf(Rect),
  debugId: React.PropTypes.string,
}

HoverActivator.defaultProps = {
  isEnabled: true,
}

export default HoverActivator
