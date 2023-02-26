import { ipcMain, BrowserWindow, Menu } from 'electron'
import { IpcId, TagGroupContextMenu, TagGroupRenameReply, TagGroupRename } from '../ipc/tagManage'
import { showFooterMessage } from '../ipc/footer'
import TagGroupUseCase from './useCase/tagGroupUseCase'

ipcMain.on(IpcId.TagGroupContextMenu.SHOW_CONTEXT_MENU, (e, arg) => {
  const reqTagGroupContextMenu: TagGroupContextMenu = JSON.parse(arg)

  const template: (Electron.MenuItemConstructorOptions | Electron.MenuItem)[] = [
    {
      label: 'タググループ名を変更',
      click: () => {
        const req: TagGroupRenameReply = {
          workspaceId: reqTagGroupContextMenu.workspaceId,
          tagGroupId: reqTagGroupContextMenu.tagGroupId,
          tagGroupName: reqTagGroupContextMenu.tagGroupName,
        }
        e.reply(IpcId.TagGroupContextMenu.SHOW_GROUP_RENAME_MODAL, JSON.stringify(req))
      },
    },
    { type: 'separator' },
    {
      label: 'タググループを削除',
      click: () => {
        TagGroupUseCase.deleteTagGroup(reqTagGroupContextMenu.workspaceId, reqTagGroupContextMenu.tagGroupId)
          .then(() => {
            e.reply(IpcId.TagGroupContextMenu.TAG_GROUP_DELETED)
          })
          .catch(err => {
            showFooterMessage(e, `タググループの削除に失敗しました。[${err}]`)
          })
      },
    },
  ]
  const menu = Menu.buildFromTemplate(template)
  const contents: any = BrowserWindow.fromWebContents(e.sender)
  menu.popup(contents)
})

ipcMain.handle(IpcId.Invoke.TAG_GROUP_RENAME, async (e, arg) => {
  const requestTagRename: TagGroupRename = JSON.parse(arg)
  try {
    await TagGroupUseCase.renameTagGroup(
      requestTagRename.workspaceId,
      requestTagRename.tagGroupId,
      requestTagRename.tagGroupName
    )
  } catch (err) {
    showFooterMessage(e, `タググループのリネームに失敗しました。[${err}]`)
  }
})
