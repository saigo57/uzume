import React from 'react';
import ReactDOM from 'react-dom';
import '../src/scss/reset.scss';
import './App.scss';

import {LeftMenu} from './Organisms/LeftMenu/LeftMenu';
import {CenterListMenu} from './Organisms/CenterListMenu/CenterListMenu';

import {RightMenu} from './Organisms/RightMenu/RightMenu';


export function App() {
  return (
    <div className="container"> 
      <LeftMenu />
      <CenterListMenu />
      <RightMenu />
    </div>
  );
}

export default App;
