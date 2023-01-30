import { ImageInfo, ImageData } from '../../../ipc/images'

export type ImageBulk = {
  imageInfo: ImageInfo
  imageData: ImageData | null
}
