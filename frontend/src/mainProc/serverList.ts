import { ipcMain } from 'electron';
import { ServerInfo } from '../ipcFormat/serverList';

// ipcを動かすための暫定プログラム

function createServerData(isSelected: boolean) {
  return {
    imagePath: "../src/contents/img/design-server-icon.jpg",
    isSelected: isSelected
  }
}

var serverList: ServerInfo[] = 
[
  createServerData(true),
  createServerData(false)
];

ipcMain.on('fetch-server-list', (e, _arg) => {
  e.reply('fetch-server-list-reply', JSON.stringify(serverList));
});

ipcMain.on('create-new-server', (e, _arg) => {
  serverList.forEach(s => { s.isSelected = false; });
  serverList.push(createServerData(true));
  e.reply('fetch-server-list-reply', JSON.stringify(serverList));
});
