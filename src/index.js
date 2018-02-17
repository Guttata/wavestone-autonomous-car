import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import AppHeader from './AppHeader/AppHeader';
import AppNavBar from './AppNavBar/AppNavBar';
import Profile from './Profile/Profile';

import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<AppHeader />, document.getElementById('AppHeader'));


ReactDOM.render(<Profile />, document.getElementById('root'));


ReactDOM.render(<AppNavBar />, document.getElementById('AppNavBar'));
registerServiceWorker();
