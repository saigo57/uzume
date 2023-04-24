import BackendConnectorWorkspace from './backendConnectorWorkspace'
import { Image as BackendConnectorImage } from 'uzume-backend-connector'
import { ImageData } from '../../ipc/images'

export default class ImageUseCase {
  public static async fetchImage(workspaceId: string, imageId: string, isThumbnail: boolean): Promise<ImageData> {
    const ws = await BackendConnectorWorkspace(workspaceId)
    const imageBase64 = await ws.image.getImage(imageId, this.imageSize(isThumbnail))
    return {
      imageId: imageId,
      imageBase64: imageBase64,
    }
  }

  private static imageSize(isThumbnail: boolean) {
    return isThumbnail ? BackendConnectorImage.IMAGE_SIZE_THUMBNAIL : BackendConnectorImage.IMAGE_SIZE_ORIGINAL
  }
}
