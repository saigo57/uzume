export class IpcId {
  static readonly NAME_SPACE: string = "tags";
  static readonly GET_ALL_TAGS: string = IpcId.NAME_SPACE + "get-all-tags";
  static readonly GET_ALL_TAGS_REPLY: string = IpcId.NAME_SPACE + "get-all-tags-reply";
  static readonly CREATE_NEW_TAG_TO_IMAGE: string = IpcId.NAME_SPACE + "create-new-tag";
  static readonly SHOW_CONTEXT_MENU: string = IpcId.NAME_SPACE + "show-context-menu";
  static readonly TO_TAG_RENAME_REPLY: string = IpcId.NAME_SPACE + "to-tag-rename-reply";
  static readonly TAG_RENAME: string = IpcId.NAME_SPACE + "tag-rename";
}

export type GetAllTags = {
  workspaceId: string
}

export type TagInfo = {
  tagId: string
  name: string
  tagGroupId: string
}

export type TagList = {
  tags: TagInfo[]
}

export type CreateTagToImage = {
  workspaceId: string
  imageIds: string[]
  tagName: string
}

export type ShowContextMenu = {
  workspaceId: string
  tagId: string
  tagName: string
}

export type TagRenameReply = {
  workspaceId: string
  tagId: string
  tagName: string
}

export type TagRename = {
  workspaceId: string
  tagId: string
  tagName: string
}
