import { IpcIdBase } from './ipcIdBase'

export class IpcId extends IpcIdBase {
  static readonly NAME_SPACE: string = 'tagManage'

  public static ToMainProc = class {
    static readonly TAG_GROUP_CONTEXT_MENU: string = IpcId.generateIpcId()
    static readonly TAG_GROUP_RENAME: string = IpcId.generateIpcId()
  }

  public static ToRenderer = class {
    static readonly TAG_GROUP_DELETE: string = IpcId.generateIpcId()
    static readonly TO_TAG_GROUP_RENAME: string = IpcId.generateIpcId()
  }
}

export type TagGroupContextMenu = {
  workspaceId: string
  tagGroupId: string
  tagGroupName: string
}

export type TagGroupRenameReply = {
  workspaceId: string
  tagGroupId: string
  tagGroupName: string
}

export type TagGroupRename = {
  workspaceId: string
  tagGroupId: string
  tagGroupName: string
}
