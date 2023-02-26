import { IpcIdBase } from './ipcIdBase'

export class IpcId extends IpcIdBase {
  static readonly NAME_SPACE: string = 'tagManage'

  public static TagGroupContextMenu = class {
    static readonly SHOW_CONTEXT_MENU: string = IpcId.generateIpcId()
    static readonly SHOW_GROUP_RENAME_MODAL: string = IpcId.generateIpcId()
    static readonly TAG_GROUP_DELETED: string = IpcId.generateIpcId()
  }

  public static Invoke = class {
    static readonly TAG_GROUP_RENAME: string = IpcId.generateIpcId()
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
