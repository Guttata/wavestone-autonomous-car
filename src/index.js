import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import DrivingModeButtons from './DrivingModeButtons';
import AppHeader from './AppHeader/AppHeader';
import AppNavBar from './AppNavBar/AppNavBar';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<AppHeader />, document.getElementById('AppHeader'));
//ReactDOM.render(<App />, document.getElementById('root'));
//ReactDOM.render(<DrivingModeButtons />, document.getElementById('DrivingModeButtons'));
ReactDOM.render(<AppNavBar />, document.getElementById('AppNavBar'));
registerServiceWorker();
