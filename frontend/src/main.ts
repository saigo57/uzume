import path from 'path';
import { app, BrowserWindow } from 'electron';
import BackendConnector from './backendConnector/backendConnector';
import { showFooterMessageByBrowserWindow } from './ipc/footer';
import './mainProc/serverList';
import './mainProc/images';
import './mainProc/tags';
import './mainProc/tagGroups';
import './mainProc/tagManage';

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

  BackendConnector.setBackendUrl('http://localhost:22113/');
  BackendConnector.onFailAuthorization = (err) => {
    showFooterMessageByBrowserWindow(win, `アクセストークンの取得に失敗しました。[${err}]`)
  }
}

// Electron の初期化が完了したらウィンドウを作成
app.whenReady().then(createWindow);
