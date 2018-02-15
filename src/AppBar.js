import React from 'react';
import AppBar from 'material-ui/AppBar';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import './AppBar.css';


/**
 * A simple example of `AppBar` with an icon on the right.
 * By default, the left icon is a navigation-menu.
 */
const AppBarHeader = () => (
 <MuiThemeProvider>
  <AppBar
    title="Wavestone Autonomous Car"
    iconClassNameRight="muidocs-icon-navigation-expand-more"
  />
  </MuiThemeProvider>
);

export default AppBarHeader;