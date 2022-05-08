import { IpcIdBase } from './ipcIdBase';

export class IpcId extends IpcIdBase {
  static readonly NAME_SPACE: string = "tagGroups";

  public static ToMainProc = class {
    static readonly GET_ALL_TAG_GROUPS: string = IpcId.generateIpcId();
    static readonly CREATE_NEW_TAG_GROUP: string = IpcId.generateIpcId();
    static readonly ADD_TO_TAG_GROUP: string = IpcId.generateIpcId();
  }

  public static ToRenderer = class {
    static readonly GET_ALL_TAG_GROUPS: string = IpcId.generateIpcId();
  }
}

export type GetAllTagGroups = {
  workspaceId: string
}

export type TagGroupInfo = {
  tagGroupId: string
  name: string
}

export type TagGroupList = {
  tag_groups: TagGroupInfo[]
}

export type CreateTagGroup = {
  workspaceId: string
  name: string
}

export type AddToTagGroup = {
  workspaceId: string
  tagGroupId: string
  tagId: string
}
