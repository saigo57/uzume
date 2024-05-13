import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './view/app'
import '../src/scss/reset.scss'
import '../src/scss/main.scss'

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);
