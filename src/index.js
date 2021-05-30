import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import GameOfLife from './LifeAndDeath';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

ReactDOM.render(
  <React.StrictMode>
    <GameOfLife />
  </React.StrictMode>,
  document.getElementById('root')
);

serviceWorkerRegistration.register();