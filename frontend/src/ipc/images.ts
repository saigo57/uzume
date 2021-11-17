export class IpcId {
  static readonly NAME_SPACE: string = "images";
  static readonly UPLOAD_IMAGES: string = IpcId.NAME_SPACE + "upload-images";
  static readonly SHOW_IMAGES: string = IpcId.NAME_SPACE + "show-images";
  static readonly SHOW_IMAGES_REPLY: string = IpcId.NAME_SPACE + "show-images-reply";
  static readonly REQUEST_IMAGE: string = IpcId.NAME_SPACE + "request-image";
  static readonly REQUEST_IMAGE_REPLY: string = IpcId.NAME_SPACE + "request-image-reply";
}

export type ImageFiles = {
  workspaceId: string
  imageFileList: string[]
}

export type ShowImages = {
  workspaceId: string
  page: number
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

export type ImageInfo = {
  image_id: string
  file_name: string
  ext: string
  memo: string
  author: string
  created_at: string
}

export type ImageInfos = {
  workspaceId: string
  page: number
  images: ImageInfo[]
}
