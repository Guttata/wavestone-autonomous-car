import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import AppBar from './AppBar';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<AppBar />, document.getElementById('AppBar'));
ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
