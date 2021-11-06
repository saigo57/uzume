import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { App } from './App';
import draggableSplitBar from './draggable_split_bar';

ReactDOM.render(
  <App />,
  document.getElementById('root')
);

draggableSplitBar("#before-main.split-bar", "#main-menu", "#main");
draggableSplitBar("#after-main.split-bar", "#main", "#side-bar");
