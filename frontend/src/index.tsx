import React from 'react';
import ReactDOM from 'react-dom';
import '../src/scss/reset.scss';
import './index.scss';
import reportWebVitals from './reportWebVitals';

import {LeftMenu} from './Organisms/LeftMenu/LeftMenu';
import {CenterListMenu} from './Organisms/CenterListMenu/CenterListMenu';


import {RightMenu} from './Organisms/RightMenu/RightMenu';


//<LeftMenu />
//<CenterListMenu />


ReactDOM.render(
  <React.StrictMode>
    <div className="container"> 
      <LeftMenu />
      <CenterListMenu />
      <RightMenu />
    </div>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
