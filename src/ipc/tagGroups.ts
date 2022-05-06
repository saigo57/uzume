export class IpcId {
  static readonly NAME_SPACE: string = "tag_groups";
  static readonly GET_ALL_TAG_GROUPS: string = IpcId.NAME_SPACE + "get-all-tag-groups";
  static readonly GET_ALL_TAG_GROUPS_REPLY: string = IpcId.NAME_SPACE + "get-all-tag-groups-reply";
  static readonly CREATE_NEW_TAG_GROUP: string = IpcId.NAME_SPACE + "create-new-tag-group";
  static readonly ADD_TO_TAG_GROUP: string = IpcId.NAME_SPACE + "add-to-tag-group";
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
