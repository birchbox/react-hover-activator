import React from 'react'
import { canHover } from '../lib/utils'

class Button extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      isHovering: false,
    }
  }

  componentWillUnmount () {
    this.unmounted = true
  }

  render () {
    return React.createElement('div', {
      onMouseEnter: this.setHovering(true),
      onMouseLeave: this.setHovering(false),
    }, this.props.children)
  }

  setHovering (isHovering) {
    return () => {
      if (!this.unmounted && canHover) {
        this.setState({ isHovering })
        this.props.onHoverChange && this.props.onHoverChange(isHovering)
      }
    }
  }
}

Button.propTypes = {
  onHoverChange: React.PropTypes.func,
}

export default Button
