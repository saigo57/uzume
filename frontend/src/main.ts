import { app, BrowserWindow } from 'electron';

function createWindow () {
  const options: Electron.BrowserWindowConstructorOptions = {
    width: 400,
    height: 300,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false 
    }
  }
  const win = new BrowserWindow(options);
  win.loadFile('dist/index.html');
}

// Electron の初期化が完了したらウィンドウを作成
app.whenReady().then(createWindow);