import React, { Component } from 'react'
import 'babel-polyfill'
import NippleJs from 'nipplejs'

import './JoystickDrivingMode.css';

class JoystickDrivingMode extends Component {
  componentWillMount() {
    this.setState({
      start: {},
      end: {},
      move: {},
      pressure: {},
    })
  }
  componentDidMount() {
    this.options = this.props.options
    this.options.zone = document.querySelector('.react-joystick')
    this.joystick = NippleJs.create(this.props.options)
    this.joystick
    .on('start', (evt, data) => {
      this.setState({
        start: data,
      })
    })
    .on('end', (evt, data) => {
      this.setState({
        end: data,
      })
    })
    .on('move', (evt, data) => {
      this.setState({
        move: data,
      })
    })
    .on('pressure', (evt, data) => {
      this.setState({
        pressure: data,
      })
    })
  }
  getRenderDebug() {
    this.renderDebug = false
    if (this.props.debug) {
      window.console.log(this.state)
    }
    return this.renderDebug
  }
  render() {
    return (
      <div className="container">
        <div className="react-joystick" />
        { this.getRenderDebug() }
        <div>Vitesse : {typeof(this.state.move.distance) !== 'undefined' ? Math.round(this.state.move.distance) : null}</div>
        <div>
          x: {typeof(this.state.move.direction) !== 'undefined' && typeof(this.state.move.direction.x) !== 'undefined' ? this.state.move.direction.x : null}
          <br/>
          y: {typeof(this.state.move.direction) !== 'undefined' && typeof(this.state.move.direction.y) !== 'undefined' ? this.state.move.direction.y : null}
          <br/>
          angle: {typeof(this.state.move.direction) !== 'undefined' && typeof(this.state.move.direction.angle) !== 'undefined' ? this.state.move.direction.angle : null}
        </div>
      </div>
    )
  }
}

JoystickDrivingMode.defaultProps = {
  options: {
    zone: '',
    size: 100,
    threshold: 0.1,
    color: 'gray',
    fadeTime: 250,
    dataOnly: false,
    restOpacity: 0.5,
    multitouch: true,
    maxNumberOfNipples: 1,
    position: {
      left: '50%',
      top: '50%',
    },
    mode: 'static',
    catchDistance: 1.0,
  },
  debug: false,
}

export default JoystickDrivingMode;
