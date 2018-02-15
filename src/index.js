import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import AppBarHeader from './AppBar';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<AppBarHeader />, document.getElementById('AppBar'));
ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
