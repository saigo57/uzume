import { ipcMain, BrowserWindow, Menu } from 'electron'
import { IpcId, GetAllTags, CreateTagToImage, ShowContextMenu, TagRenameReply, TagRename } from '../ipc/tags'
import { CreatedTagToImage } from '../ipc/tags'
import { showFooterMessage } from '../ipc/footer'
import TagUseCase from './useCase/tagUseCase'

ipcMain.handle(IpcId.Invoke.GET_ALL_TAGS, async (e, arg) => {
  const reqAllTags: GetAllTags = JSON.parse(arg)
  const tags = await TagUseCase.fetchAllTags(reqAllTags.workspaceId)
  return JSON.stringify({ tags: tags })
})

ipcMain.handle(IpcId.Invoke.CREATE_NEW_TAG_TO_IMAGE, async (e, arg) => {
  const createTag: CreateTagToImage = JSON.parse(arg)

  try {
    const createdTagInfo = await TagUseCase.createNewTag(createTag.workspaceId, createTag.tagName)

    const createdTagToImage = {
      createTag: createTag,
      createdTagInfo: createdTagInfo,
    } as CreatedTagToImage
    return JSON.stringify(createdTagToImage)
  } catch (err) {
    showFooterMessage(e, `画像へのタグ付与に失敗しました。[${err}]`)
  }
})

ipcMain.on(IpcId.TagContextMenu.SHOW_CONTEXT_MENU, (e, arg) => {
  const requestShowContextMenu: ShowContextMenu = JSON.parse(arg)

  const template: (Electron.MenuItemConstructorOptions | Electron.MenuItem)[] = [
    {
      label: `お気に入り登録${requestShowContextMenu.currFavorite ? '解除' : ''}`,
      click: () => {
        if (requestShowContextMenu.currFavorite) {
          TagUseCase.removeFavorite(requestShowContextMenu.workspaceId, requestShowContextMenu.tagId)
            .then(() => {
              e.reply(IpcId.TagContextMenu.TAG_FAVORITE_CHANGED)
            })
            .catch(err => {
              showFooterMessage(e, `お気に入りタグからの削除に失敗しました。[${err}]`)
            })
        } else {
          TagUseCase.addFavorite(requestShowContextMenu.workspaceId, requestShowContextMenu.tagId)
            .then(() => {
              e.reply(IpcId.TagContextMenu.TAG_FAVORITE_CHANGED)
            })
            .catch(err => {
              showFooterMessage(e, `お気に入りタグへの追加に失敗しました。[${err}]`)
            })
        }
      },
    },
    {
      label: 'タグ名を変更',
      click: () => {
        const req: TagRenameReply = {
          workspaceId: requestShowContextMenu.workspaceId,
          tagId: requestShowContextMenu.tagId,
          tagName: requestShowContextMenu.tagName,
        }
        e.reply(IpcId.TagContextMenu.SHOW_TAG_RENAME_MODAL, JSON.stringify(req))
      },
    },
  ]
  const menu = Menu.buildFromTemplate(template)
  const contents: any = BrowserWindow.fromWebContents(e.sender)
  menu.popup(contents)
})

ipcMain.handle(IpcId.Invoke.TAG_RENAME, async (e, arg) => {
  const requestTagRename: TagRename = JSON.parse(arg)

  try {
    await TagUseCase.renameTag(requestTagRename.workspaceId, requestTagRename.tagId, requestTagRename.tagName)
  } catch (err) {
    showFooterMessage(e, `タグのリネームに失敗しました。[${err}]`)
  }
})
