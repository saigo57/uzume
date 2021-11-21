import { ipcMain } from 'electron';
import {
  IpcId,
  GetAllTags,
  TagInfo,
  CreateTagToImage,
} from '../ipc/tags'
import {
  addTagToImages,
} from './images'
import BackendConnector from '../backendConnector/backendConnector';

ipcMain.on(IpcId.GET_ALL_TAGS, (e, arg) => {
  let reqAllTags: GetAllTags = JSON.parse(arg)
  getNewTags(e, reqAllTags.workspaceId)
});

ipcMain.on(IpcId.CREATE_NEW_TAG_TO_IMAGE, (e, arg) => {
  let createTag: CreateTagToImage = JSON.parse(arg)
  BackendConnector.workspace(createTag.workspaceId, (ws) => {
    ws.tags.createNewTag(createTag.tagName).then((tagInfo) => {
      // タグ再取得
      getNewTags(e, createTag.workspaceId)
      // 画像にタグ付与
      addTagToImages(e, createTag.workspaceId, createTag.imageIds, tagInfo.tag_id)
    })
  });
});

function getNewTags(e: Electron.IpcMainEvent, workspaceId: string) {
  BackendConnector.workspace(workspaceId, (ws) => {
    ws.tags.getList(false).then((resTagList) => {
      let tags: TagInfo[] = []
      if ( resTagList.tags !== null ) {
        for (let i = 0; i < resTagList.tags.length; i++) {
          tags.push({
            tagId: resTagList.tags[i].tag_id,
            name: resTagList.tags[i].name,
          })
        }
      }
      e.reply(IpcId.GET_ALL_TAGS_REPLY, JSON.stringify({tags: tags}));
    })
  });
}
