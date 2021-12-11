export class IpcId {
  static readonly NAME_SPACE: string = "tags";
  static readonly GET_ALL_TAGS: string = IpcId.NAME_SPACE + "get-all-tags";
  static readonly GET_ALL_TAGS_REPLY: string = IpcId.NAME_SPACE + "get-all-tags-reply";
  static readonly CREATE_NEW_TAG_TO_IMAGE: string = IpcId.NAME_SPACE + "create-new-tag";
}

export type GetAllTags = {
  workspaceId: string
}

export type TagInfo = {
  tagId: string
  name: string
}

export type TagList = {
  tags: TagInfo[]
}

export type CreateTagToImage = {
  workspaceId: string
  imageIds: string[]
  tagName: string
}
