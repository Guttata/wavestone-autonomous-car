import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import FontIcon from 'material-ui/FontIcon';
import {BottomNavigation, BottomNavigationItem} from 'material-ui/BottomNavigation';
import Paper from 'material-ui/Paper';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import './AppNavBar.css';


import Profile from '../Profile/Profile'
import JoystickDrivingMode from '../DrivingMode/JoystickDrivingMode';
import DrivingModeButtons from '../DrivingMode/DrivingModeButtons';

const accountIcon = <FontIcon className="material-icons">account_circle</FontIcon>;
const driveIcon = <FontIcon className="material-icons">drive_eta</FontIcon>;
const paramIcon = <FontIcon className="material-icons">build</FontIcon>;


/**
 * A simple example of `BottomNavigation`, with three labels and icons
 * provided. The selected `BottomNavigationItem` is determined by application
 * state (for instance, by the URL).
 */
class AppNavBar extends Component {
  state = {
    selectedIndex: 0,
    showProfile : false,
    showDriving: false,
    showParameter: false,
  };

  select = (index) => this.setState({selectedIndex: index});

  showProfileModal(){
    this.select(0);
    this.setState({
      showProfile: true,
      showDriving: false,
      showParameter: false,
    });
    ReactDOM.render(<Profile />, document.getElementById('root'));
    ReactDOM.render(<div />, document.getElementById('DrivingModeButtons'));
  }

  showDrivingModal(){
    this.select(1);
    this.setState({
      showProfile: false,
      showDriving: true,
      showParameter: false,
    });
    ReactDOM.render(<JoystickDrivingMode />, document.getElementById('root'));
    ReactDOM.render(<DrivingModeButtons />, document.getElementById('DrivingModeButtons'));
  }
  
  showParameterModal(){
    this.select(2);
    this.setState({
      showProfile: false,
      showDriving: false,
      showParameter: true,
    });
    ReactDOM.render(<div />, document.getElementById('root'));
    ReactDOM.render(<div />, document.getElementById('DrivingModeButtons'));
  }

  render() {
    return (
      <MuiThemeProvider>
        <Paper zDepth={1}>
          <BottomNavigation selectedIndex={this.state.selectedIndex}>
            <BottomNavigationItem
              label="Profile"
              icon={accountIcon}
              onClick={() => this.showProfileModal()}
            />
            <BottomNavigationItem
              label="Drive"
              icon={driveIcon}
              onClick={() => this.showDrivingModal()}
            />
            <BottomNavigationItem
              label="Parameters"
              icon={paramIcon}
              onClick={() => this.showParameterModal()}
            />
          </BottomNavigation>
        </Paper>
      </MuiThemeProvider>
  );
}
}

export default AppNavBar;
