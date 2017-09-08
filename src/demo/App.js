import React from 'react'
import ReactDOM from 'react-dom'
import _ from 'lodash'
import { HoverActivator, Rect } from '../lib'
import Button from './Button'

class App extends React.Component {
  constructor (props) {
    super(props)
    this.state = { isOpen: false, wasOpened: false, buttonRect: null, menuRect: null }
    this.componentDidMount =
    this.componentDidUpdate =
    this.measureNodeRects
  }

  componentWillUnmount () {
    this.unmounted = true
  }

  measureNodeRects () {
    const { props, state } = this
    let newState = {}
    if (this.buttonNode) {
      const buttonRect = Rect.fromNode(this.buttonNode)
      if (buttonRect.hasSize() && !buttonRect.isEqual(state.buttonRect)) {
        newState = { ...newState, buttonRect }
      }
    }
    if (state.isOpen && this.menuNode) {
      const menuRect = Rect.fromNode(this.menuNode)
      if (menuRect.hasSize() && !menuRect.isEqual(state.menuRect)) {
        newState = { ...newState, menuRect }
      }
    }
    if (!_.isEmpty(newState)) {
      !this.unmounted && this.setState(newState)
    }
  }

  close () {
    !this.unmounted && this.setState({ isOpen: false })
  }

  open () {
    this.setState({ isOpen: true, wasOpened: true })
  }

  render () {
    const { buttonRect, menuRect } = this.state
    const hoverProps = {
      getActiveKey: () => this.state.isOpen,
      onActiveKeyChange: (key) => this[key ? 'open' : 'close'](),
      targetAlignment: buttonRect && menuRect && buttonRect.getRelativeAlignment(menuRect),
      targetRect: menuRect,
    }
    return <HoverActivator {...hoverProps}>
      {({ handleSourceHoverChange, handleTargetHoverChange }) => {
        const buttonProps = {
          onHoverChange: handleSourceHoverChange,
          ref: (c) => this.buttonNode = ReactDOM.findDOMNode(c),
        }
        const menuProps = {
          style: this.state.isOpen && buttonRect ? undefined : { display: 'none' },
          onMouseEnter: _.partial(handleTargetHoverChange, true),
          onMouseLeave: _.partial(handleTargetHoverChange, false),
          ref: (node) => this.menuNode = node,
        }
        return <div>
          <Button {...buttonProps}>Hover me</Button>
          {this.state.wasOpened
            && <div {...menuProps}>
              <ul>
                <li>Menu item 1</li>
                <li>Menu item 2</li>
                <li>Menu item 3</li>
                <li>Menu item 4</li>
                <li>Menu item 5</li>
              </ul>
            </div>
          }
        </div>
      }}
    </HoverActivator>
  }

}

export default App
