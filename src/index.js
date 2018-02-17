import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import AppHeader from './AppHeader/AppHeader';
import AppNavBar from './AppNavBar/AppNavBar';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<AppHeader />, document.getElementById('AppHeader'));
ReactDOM.render(<AppNavBar />, document.getElementById('AppNavBar'));
registerServiceWorker();
