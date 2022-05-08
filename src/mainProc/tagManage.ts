import { ipcMain, BrowserWindow, Menu } from 'electron';
import {
  IpcId,
  TagGroupContextMenu,
  TagGroupRenameReply,
  TagGroupRename,
} from '../ipc/tagManage';
import { getNewTags } from './tags';
import { fetchAllTagGroups } from './tagGroups';
import { BackendConnector } from 'uzume-backend-connector';
import { showFooterMessage } from '../ipc/footer';

ipcMain.on(IpcId.ToMainProc.TAG_GROUP_CONTEXT_MENU, (e, arg) => {
  let reqTagGroupContextMenu: TagGroupContextMenu = JSON.parse(arg)

  const template: (Electron.MenuItemConstructorOptions | Electron.MenuItem)[] = [
    {
      label: 'タググループ名を変更',
      click: () => {
        let req: TagGroupRenameReply = {
          workspaceId: reqTagGroupContextMenu.workspaceId,
          tagGroupId: reqTagGroupContextMenu.tagGroupId,
          tagGroupName: reqTagGroupContextMenu.tagGroupName,
        }
        e.reply(IpcId.ToRenderer.TO_TAG_GROUP_RENAME, JSON.stringify(req))
      }
    },
    { type: 'separator' },
    {
      label: 'タググループを削除',
      click: () => {
        BackendConnector.workspace(reqTagGroupContextMenu.workspaceId, (ws) => {
          ws.tag_groups.DeleteTagGroup(reqTagGroupContextMenu.tagGroupId).then(() => {
            getNewTags(e, reqTagGroupContextMenu.workspaceId);
            fetchAllTagGroups(e, reqTagGroupContextMenu.workspaceId);
            e.reply(IpcId.ToRenderer.TAG_GROUP_DELETE)
          }).catch((err) => {
            showFooterMessage(e, `タググループの削除に失敗しました。[${err}}]`);
          })
        });
      }
    }
  ]
  const menu = Menu.buildFromTemplate(template)
  let contents: any = BrowserWindow.fromWebContents(e.sender)
  menu.popup(contents)
});

ipcMain.on(IpcId.ToMainProc.TAG_GROUP_RENAME, (e, arg) => {
  let requestTagRename: TagGroupRename = JSON.parse(arg)

  BackendConnector.workspace(requestTagRename.workspaceId, (ws) => {
    ws.tag_groups.RenameTagGroup(requestTagRename.tagGroupId, requestTagRename.tagGroupName).then(() => {
      fetchAllTagGroups(e, requestTagRename.workspaceId);
    }).catch((err) => {
      showFooterMessage(e, `タググループのリネームに失敗しました。[${err}}]`);
    });
  });
});
