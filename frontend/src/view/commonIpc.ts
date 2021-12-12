import {
  IpcId as TagsIpcId,
  GetAllTags,
} from '../ipc/tags';

var prevWorkspaceId: string = "";

export const sendIpcGetAllTags = (workspaceId: string) => {
  if ( prevWorkspaceId == workspaceId ) return;
  prevWorkspaceId = workspaceId;

  let req = {
    workspaceId: workspaceId,
  } as GetAllTags

  window.api.send(TagsIpcId.GET_ALL_TAGS, JSON.stringify(req));
};
