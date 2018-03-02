import React, { Component } from 'react'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RaisedButton from 'material-ui/RaisedButton';
import { AutoPilot } from './DriveClientWebSocket'
import { Stop } from './DriveClientWebSocket'

const style = {
  margin: 12,
};

class AutoPilotDrivingMode extends Component {
  render() {
    return (
      <MuiThemeProvider>
        <div className="container">
          <RaisedButton label="Start AutoPilot" primary={true} style={style} onClick={() => AutoPilot()} />
          <RaisedButton label="Stop" secondary={true} style={style} onClick={() => Stop()}/>
        </div>
      </MuiThemeProvider>
    )
  }
}

export default AutoPilotDrivingMode;
