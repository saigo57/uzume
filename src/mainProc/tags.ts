import { ipcMain, BrowserWindow, Menu } from 'electron';
import {
  IpcId,
  GetAllTags,
  TagInfo,
  CreateTagToImage,
  ShowContextMenu,
  TagRenameReply,
  TagRename,
} from '../ipc/tags'
import {
  addTagToImages,
} from './images'
import { BackendConnector } from 'uzume-backend-connector';
import { showFooterMessage } from '../ipc/footer';

ipcMain.on(IpcId.ToMainProc.GET_ALL_TAGS, (e, arg) => {
  let reqAllTags: GetAllTags = JSON.parse(arg)
  getNewTags(e, reqAllTags.workspaceId)
});

ipcMain.on(IpcId.ToMainProc.CREATE_NEW_TAG_TO_IMAGE, (e, arg) => {
  let createTag: CreateTagToImage = JSON.parse(arg)
  BackendConnector.workspace(createTag.workspaceId, (ws) => {
    ws.tags.createNewTag(createTag.tagName).then((tagInfo) => {
      // タグ再取得
      getNewTags(e, createTag.workspaceId)
      // 画像にタグ付与
      addTagToImages(e, createTag.workspaceId, createTag.imageIds, tagInfo.tag_id)
    }).catch((err) => {
      showFooterMessage(e, `画像へのタグ付与に失敗しました。[${err}}]`);
    })
  });
});

ipcMain.on(IpcId.ToMainProc.SHOW_CONTEXT_MENU, (e, arg) => {
  let requestShowContextMenu: ShowContextMenu = JSON.parse(arg)

  const template: (Electron.MenuItemConstructorOptions | Electron.MenuItem)[] = [
    {
      label: `お気に入り登録${requestShowContextMenu.currFavorite ? '解除' : ''}`,
      click: () => {
        if ( requestShowContextMenu.currFavorite ) {
          BackendConnector.workspace(requestShowContextMenu.workspaceId, (ws) => {
            ws.tags.removeFavorite(requestShowContextMenu.tagId).then(() => {
              getNewTags(e, requestShowContextMenu.workspaceId)
            }).catch((err) => {
              showFooterMessage(e, `お気に入りタグからの削除に失敗しました。[${err}}]`);
            })
          })
        } else {
          BackendConnector.workspace(requestShowContextMenu.workspaceId, (ws) => {
            ws.tags.addFavorite(requestShowContextMenu.tagId).then(() => {
              getNewTags(e, requestShowContextMenu.workspaceId)
            }).catch((err) => {
              showFooterMessage(e, `お気に入りタグへの追加に失敗しました。[${err}}]`);
            })
          })
        }
      }
    },
    {
      label: 'タグ名を変更',
      click: () => {
        let req: TagRenameReply = {
          workspaceId: requestShowContextMenu.workspaceId,
          tagId: requestShowContextMenu.tagId,
          tagName: requestShowContextMenu.tagName,
        }
        e.reply(IpcId.ToRenderer.TO_TAG_RENAME, JSON.stringify(req))
      }
    }
  ]
  const menu = Menu.buildFromTemplate(template)
  let contents: any = BrowserWindow.fromWebContents(e.sender)
  menu.popup(contents)
});

ipcMain.on(IpcId.ToMainProc.TAG_RENAME, (e, arg) => {
  let requestTagRename: TagRename = JSON.parse(arg)

  BackendConnector.workspace(requestTagRename.workspaceId, (ws) => {
    ws.tags.renameTag(requestTagRename.tagId, requestTagRename.tagName).then(() => {
      getNewTags(e, requestTagRename.workspaceId)
    }).catch((err) => {
      showFooterMessage(e, `タグのリネームに失敗しました。[${err}}]`);
    });
  });
});

export function getNewTags(e: Electron.IpcMainEvent, workspaceId: string) {
  BackendConnector.workspace(workspaceId, (ws) => {
    ws.tags.getList(false).then((resTagList) => {
      let tags: TagInfo[] = []
      if ( resTagList.tags !== null ) {
        for (let i = 0; i < resTagList.tags.length; i++) {
          tags.push({
            tagId: resTagList.tags[i].tag_id,
            name: resTagList.tags[i].name,
            tagGroupId: resTagList.tags[i].tag_group_id,
            favorite: resTagList.tags[i].favorite,
          })
        }
      }
      e.reply(IpcId.ToRenderer.GET_ALL_TAGS, JSON.stringify({tags: tags}));
    }).catch((err) => {
      showFooterMessage(e, `タグリストの取得に失敗しました。[${err}}]`);
    })
  });
}
