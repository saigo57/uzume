import { app, BrowserWindow, ipcMain, autoUpdater, dialog } from 'electron';
import { IpcId } from './ipc/autoUpdate';
const axiosBase = require('axios');

const SERVER_URL = 'https://uzume-update-server.amanoiwato.link';
let feedFeedUrl: string | null = null;

export function autoUpdateInit() {
  feedFeedUrl = `${SERVER_URL}/update/${process.platform}/v${app.getVersion()}`
  // autoUpdaterはアプリが署名されていないといけないが、開発中はされていないのでスキップ
  if ( process.env.NODE_ENV === 'development' ) return;

  if ( feedFeedUrl ) autoUpdater.setFeedURL({ url: feedFeedUrl })
}

export function checkUpdate(win: BrowserWindow) {
  if ( !feedFeedUrl ) return;

  let axios = axiosBase.create({
    baseURL: feedFeedUrl,
    headers: {
      'Content-Type': 'application/json',
    },
    responseType: 'json'
  });

  win.webContents.on('did-finish-load', () => {
    axios.get('').then((res:any) => {
      if ( res.status != 200 ) return;
      win.webContents.send(IpcId.SHOW_UPDATE_MODAL_REPLY)
    });
  })
}

autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
  const dialogOpts = {
    type: 'info',
    buttons: ['再起動してアップデート', 'あとで'],
    title: 'uzumeアップデート',
    message: process.platform === 'win32' ? releaseNotes : releaseName,
    detail: '新しいバージョンがダウンロードされました。再起動するとアップデートが適用されます。'
  }

  dialog.showMessageBox(dialogOpts).then((returnValue) => {
    if (returnValue.response === 0) autoUpdater.quitAndInstall()
  })
})

ipcMain.on(IpcId.QUIT_AND_INSTALL, (e, arg) => {
  autoUpdater.checkForUpdates()
});
