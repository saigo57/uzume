import { IpcIdBase } from './ipcIdBase'

export class IpcId extends IpcIdBase {
  static readonly NAME_SPACE: string = 'tags'

  public static TagContextMenu = class {
    static readonly SHOW_CONTEXT_MENU: string = IpcId.generateIpcId()
    static readonly TAG_FAVORITE_CHANGED: string = IpcId.generateIpcId()
    static readonly SHOW_TAG_RENAME_MODAL: string = IpcId.generateIpcId()
  }

  public static Invoke = class {
    static readonly GET_ALL_TAGS: string = IpcId.generateIpcId()
    static readonly TAG_RENAME: string = IpcId.generateIpcId()
    static readonly CREATE_NEW_TAG_TO_IMAGE: string = IpcId.generateIpcId()
  }
}

export type GetAllTags = {
  workspaceId: string
}

export type TagInfo = {
  tagId: string
  name: string
  tagGroupId: string
  favorite: boolean
}

export type TagList = {
  tags: TagInfo[]
}

export type CreateTagToImage = {
  workspaceId: string
  imageIds: string[]
  tagName: string
}

export type CreatedTagToImage = {
  createTag: CreateTagToImage
  createdTagInfo: TagInfo
}

export type ShowContextMenu = {
  workspaceId: string
  tagId: string
  tagName: string
  currFavorite: boolean
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
