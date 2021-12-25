import { ipcMain } from 'electron';
import {
  IpcId,
  GetAllTagGroups,
  TagGroupInfo,
  CreateTagGroup,
  AddToTagGroup,
} from '../ipc/tagGroups';
import {
  getNewTags
} from './tags';
import BackendConnector from '../backendConnector/backendConnector';

ipcMain.on(IpcId.GET_ALL_TAG_GROUPS, (e, arg) => {
  let reqAllTagGroups: GetAllTagGroups = JSON.parse(arg)
  fetchAllTagGroups(e, reqAllTagGroups.workspaceId);
});

ipcMain.on(IpcId.CREATE_NEW_TAG_GROUP, (e, arg) => {
  let reqCreateTagGroup: CreateTagGroup = JSON.parse(arg)
  BackendConnector.workspace(reqCreateTagGroup.workspaceId, (ws) => {
    ws.tag_groups.createNewTagGroup(reqCreateTagGroup.name).then(() => {
      fetchAllTagGroups(e, reqCreateTagGroup.workspaceId);
    })
  });
});

ipcMain.on(IpcId.ADD_TO_TAG_GROUP, (e, arg) => {
  let reqAddToTagGroup: AddToTagGroup = JSON.parse(arg)
  BackendConnector.workspace(reqAddToTagGroup.workspaceId, (ws) => {
    ws.tag_groups.AddTagToTagGroup(reqAddToTagGroup.tagGroupId, reqAddToTagGroup.tagId).then(() => {
      getNewTags(e, reqAddToTagGroup.workspaceId);
    })
  });
});

export function fetchAllTagGroups(e: Electron.IpcMainEvent, workspace_id: string) {
  BackendConnector.workspace(workspace_id, (ws) => {
    ws.tag_groups.getList().then((resTagList) => {
      let tag_groups: TagGroupInfo[] = []
      if ( resTagList.tag_groups !== null ) {
        for (let i = 0; i < resTagList.tag_groups.length; i++) {
          tag_groups.push({
            tagGroupId: resTagList.tag_groups[i].tag_group_id,
            name: resTagList.tag_groups[i].name,
          })
        }
      }
      e.reply(IpcId.GET_ALL_TAG_GROUPS_REPLY, JSON.stringify({tag_groups: tag_groups}));
    })
  });
}
