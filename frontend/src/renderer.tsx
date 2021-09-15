import React from 'react';
import ReactDOM from 'react-dom';
import DesignApp from './design/design_app';
import '../src/scss/reset.scss';
import '../src/scss/main.scss';

import draggableSplitBar from './design/draggable_split_bar';

ReactDOM.render(<DesignApp />, document.getElementById('root'));


draggableSplitBar("#before-main.split-bar", "#main-menu", "#main");
draggableSplitBar("#after-main.split-bar", "#main", "#side-bar");
