import React, {Component} from 'react';
import FontIcon from 'material-ui/FontIcon';
import {BottomNavigation, BottomNavigationItem} from 'material-ui/BottomNavigation';
import Paper from 'material-ui/Paper';
import IconLocationOn from 'material-ui/svg-icons/communication/location-on';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import './NavBar.css';

const accountIcon = <FontIcon className="material-icons">account_circle</FontIcon>;
const driveIcon = <FontIcon className="material-icons">drive_eta</FontIcon>;
const paramIcon = <FontIcon className="material-icons">build</FontIcon>;


/**
 * A simple example of `BottomNavigation`, with three labels and icons
 * provided. The selected `BottomNavigationItem` is determined by application
 * state (for instance, by the URL).
 */
class NavBar extends Component {
  state = {
    selectedIndex: 0,
  };

  select = (index) => this.setState({selectedIndex: index});

  render() {
    return (
     <MuiThemeProvider>
      <Paper zDepth={1}>
        <BottomNavigation selectedIndex={this.state.selectedIndex}>
          <BottomNavigationItem
            label="Account"
            icon={accountIcon}
            onClick={() => this.select(0)}
          />
          <BottomNavigationItem
            label="Drive"
            icon={driveIcon}
            onClick={() => this.select(1)}
          />
          <BottomNavigationItem
            label="Parameters"
            icon={paramIcon}
            onClick={() => this.select(2)}
          />
        </BottomNavigation>
      </Paper>
        </MuiThemeProvider>
    );
  }
}

export default NavBar;