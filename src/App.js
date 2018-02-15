import React, { Component, PropTypes } from 'react'
import ReactAccelerometer from 'react-accelerometer'
import { Motion, spring } from 'react-motion'
import logo from './logo.svg';
import './App.css';

/* Combining React-Accelerometer with React-Motion */
const ReactAccelerometerMotion = ({ children }) => (
        <ReactAccelerometer>
          {(position) => {
            if (!position) {
              return children({ x: 0, y: 0 })
            }

            return (
              <Motion style={{ x: spring(position.x), y: spring(position.y) }}>
                {pos => children(pos)}
              </Motion>
            )
          }}
        </ReactAccelerometer>
      )

      const App = () => (
        <ReactAccelerometerMotion>
          {({ x, y }) => {
            const shadowStyle = {
              transform: `translate3d(${x * 8}px, ${y * 5 + 30}px, 0) rotateY(${-x * 3}deg)`
            }

            const imageStyle = {
              transform: `translate3d(${x * 2}px, ${y * -2 - 10}px, 0) rotateY(${-x * 3}deg)`
            }

            return (
              <div className="container">
                <div className="shadow" style={shadowStyle} />
                <div className="image" style={imageStyle} />
              </div>
            )
          }}
        </ReactAccelerometerMotion>
      )




export default App;
