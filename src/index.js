import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import AppBarHeader from './AppBar';
import NavBar from './NavBar';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<AppBarHeader />, document.getElementById('AppBar'));
ReactDOM.render(<App />, document.getElementById('root'));
ReactDOM.render(<NavBar />, document.getElementById('NavBar'));
registerServiceWorker();
