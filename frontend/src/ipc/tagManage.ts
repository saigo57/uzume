export class IpcId {
  static readonly NAME_SPACE: string = "tag_groups";
  static readonly TAG_GROUP_CONTEXT_MENU: string = IpcId.NAME_SPACE + "tag-group-context-menu";
  static readonly TAG_GROUP_DELETE_REPLY: string = IpcId.NAME_SPACE + "tag-group-delete-reply";
}

export type TagGroupContextMenu = {
  workspaceId: string
  tagGroupId: string
}
