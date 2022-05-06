export class IpcId {
  static readonly NAME_SPACE: string = "tag_groups";
  static readonly TAG_GROUP_CONTEXT_MENU: string = IpcId.NAME_SPACE + "tag-group-context-menu";
  static readonly TAG_GROUP_DELETE_REPLY: string = IpcId.NAME_SPACE + "tag-group-delete-reply";
  static readonly TO_TAG_GROUP_RENAME_REPLY: string = IpcId.NAME_SPACE + "to-tag-group-rename-reply";
  static readonly TAG_GROUP_RENAME_REPLY: string = IpcId.NAME_SPACE + "tag-group-rename-reply";
  static readonly TAG_GROUP_RENAME: string = IpcId.NAME_SPACE + "tag-group-rename";
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
