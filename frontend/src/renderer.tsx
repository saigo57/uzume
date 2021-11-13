import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { App } from './view/app';
import '../src/scss/reset.scss';
import '../src/scss/main.scss';

import draggableSplitBar from './view/lib/draggableSplitBar';

ReactDOM.render(<App />, document.getElementById('root'));

draggableSplitBar("#before-main.split-bar", "#main-menu", "#browse-image-area");
draggableSplitBar("#after-browse-image-area.split-bar", "#browse-image-area", "#image-side-bar");
