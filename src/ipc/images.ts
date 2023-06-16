import { IpcIdBase } from './ipcIdBase'

export class IpcId extends IpcIdBase {
  static readonly NAME_SPACE: string = 'images'

  public static ImageContextMenu = class {
    static readonly SHOW_CONTEXT_MENU: string = IpcId.generateIpcId()
    static readonly RELOAD_IMAGES: string = IpcId.generateIpcId()
  }

  public static ToRenderer = class {
    static readonly IMAGE_UPLOAD_PROGRESS: string = IpcId.generateIpcId()
  }

  public static Invoke = class {
    static readonly FETCH_IMAGE_LIST: string = IpcId.generateIpcId()
    static readonly FETCH_IMAGE: string = IpcId.generateIpcId()
    static readonly UPLOAD_IMAGES: string = IpcId.generateIpcId()
    static readonly ADD_TAG: string = IpcId.generateIpcId()
    static readonly REMOVE_TAG: string = IpcId.generateIpcId()
    static readonly REQUEST_GROUP_IMAGE_INFO_LIST: string = IpcId.generateIpcId()
    static readonly SORT_GROUP_IMAGES: string = IpcId.generateIpcId()
  }
}

export type FetchImage = {
  workspaceId: string
  imageId: string
  isThumbnail: boolean
}

export type ShowContextMenu = {
  workspaceId: string
  imageIds: string[]
}

export type ImageFiles = {
  workspaceId: string
  imageFileList: string[]
  tagIds: string[]
  searchType: string
}

export type ShowImages = {
  workspaceId: string
  page: number
  tagIds: string[]
  searchType: string
  uncategorized: boolean
}

export type RequestImage = {
  workspaceId: string
  imageId: string
  isThumbnail: boolean
}

export type ImageData = {
  imageId: string
  imageBase64: string
}

export type RequestImageInfo = {
  workspaceId: string
  imageIds: string[]
}

export type ImageInfo = {
  image_id: string
  file_name: string
  ext: string
  width: number
  height: number
  memo: string
  author: string
  created_at: string
  tags: string[]
  is_group_thumb_nail: boolean
  group_id: string
}

export type ImageInfos = {
  workspaceId: string
  page: number
  images: ImageInfo[]
}

export type AddTagToImage = {
  workspaceId: string
  imageIds: string[]
  tagId: string
}

export type RemoveTagFromImage = {
  workspaceId: string
  imageIds: string[]
  tagId: string
}

export type ImageUploadProgress = {
  completeCnt: number
  allImagesCnt: number
}

export type SortGroupImages = {
  workspaceId: string
  imageIds: string[]
  groupId: string
  currThumbImageId: string
}

export type GroupThumbChanged = {
  workspaceId: string
  prevThumbImageId: string
  image: ImageInfo
}
