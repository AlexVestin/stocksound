import React from 'react';
import ReactDOM from 'react-dom';
import './style/index.css';
import App from './App';
import registerServiceWorker from './util/registerServiceWorker'

import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();
registerServiceWorker()
ReactDOM.render(<App />, document.getElementById('root'));
