import path from 'path';
import { app, BrowserWindow } from 'electron';
import './mainProc/serverList';
import './mainProc/images';

function createWindow () {
  const options: Electron.BrowserWindowConstructorOptions = {
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      worldSafeExecuteJavaScript: true,
      preload: path.join(__dirname, 'preload.js'),
    }
  }

  const win = new BrowserWindow(options);

  // 開発時にはデベロッパーツールを開く
  if (process.env.NODE_ENV === 'development') {
    win.webContents.openDevTools({ mode: 'detach' });
  }

  win.loadFile('dist/app.html');
}

// Electron の初期化が完了したらウィンドウを作成
app.whenReady().then(createWindow);
