import { ipcMain, BrowserWindow, Menu } from 'electron';
import { IpcId, TagGroupContextMenu } from '../ipc/tagManage';
import { getNewTags } from './tags';
import { fetchAllTagGroups } from './tagGroups';
import BackendConnector from '../backendConnector/backendConnector';

ipcMain.on(IpcId.TAG_GROUP_CONTEXT_MENU, (e, arg) => {
  let req: TagGroupContextMenu = JSON.parse(arg)

  const template: (Electron.MenuItemConstructorOptions | Electron.MenuItem)[] = [
    {
      label: '削除',
      click: () => {
        BackendConnector.workspace(req.workspaceId, (ws) => {
          ws.tag_groups.DeleteTagGroup(req.tagGroupId).then(() => {
            getNewTags(e, req.workspaceId);
            fetchAllTagGroups(e, req.workspaceId);
            e.reply(IpcId.TAG_GROUP_DELETE_REPLY)
          })
        });
      }
    }
  ]
  const menu = Menu.buildFromTemplate(template)
  let contents: any = BrowserWindow.fromWebContents(e.sender)
  menu.popup(contents)
});
