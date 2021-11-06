import React from 'react';
import ReactDOM from 'react-dom';
import '../src/scss/reset.scss';
import './index.scss';

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
