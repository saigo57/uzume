import BackendConnectorWorkspace from './backendConnectorWorkspace'
import { Image as BackendConnectorImage, ResImage } from 'uzume-backend-connector'
import { ImageData, ImageInfo, ImageInfos } from '../../ipc/images'
import { Globals } from './../globals'

export default class ImageUseCase {
  public static async fetchImage(workspaceId: string, imageId: string, isThumbnail: boolean): Promise<ImageData> {
    const ws = await BackendConnectorWorkspace(workspaceId)
    const imageBase64 = await ws.image.getImage(imageId, this.imageSize(isThumbnail))
    return {
      imageId: imageId,
      imageBase64: imageBase64,
    }
  }

  public static async fetchImageList(
    workspaceId: string,
    page: number,
    tagIds: string[],
    searchType: string
  ): Promise<ImageInfos> {
    const ws = await BackendConnectorWorkspace(workspaceId)
    const imgList = await ws.image.getList(page, tagIds, searchType)
    const imageInfos: ImageInfos = {
      workspaceId: workspaceId,
      page: imgList.page,
      images: [],
    }

    if (imgList.images != null) {
      for (let i = 0; i < imgList.images.length; i++) {
        const imageInfo: ImageInfo = this.resImageToImageInfo(imgList.images[i])
        imageInfos.images.push(imageInfo)

        if (!(workspaceId in Globals.imageInfoList)) Globals.imageInfoList[workspaceId] = {}
        Globals.imageInfoList[workspaceId][imageInfo.image_id] = imageInfo
      }
    }

    return imageInfos
  }

  public static async uploadImages(
    workspaceId: string,
    imageFileList: string[],
    imageUploaded: (finishNum: number, allNum: number) => void
  ) {
    const ws = await BackendConnectorWorkspace(workspaceId)
    await ws.image.create(imageFileList, imageUploaded)
  }

  public static async addTagToImages(workspaceId: string, imageIds: string[], tagId: string): Promise<ImageInfo[]> {
    const ws = await BackendConnectorWorkspace(workspaceId)
    const imageInfoList: ImageInfo[] = []
    for (let i = 0; i < imageIds.length; i++) {
      const imageInfo = Globals.imageInfoList[workspaceId][imageIds[i]]
      if (imageInfo.tags.includes(tagId)) continue // 既に付与されていたらスキップする

      ws.image.addTag(imageIds[i], tagId)
      imageInfo.tags.push(tagId)
      imageInfoList.push(imageInfo)
    }

    return imageInfoList
  }

  public static async removeTagToImages(workspaceId: string, imageIds: string[], tagId: string): Promise<ImageInfo[]> {
    const ws = await BackendConnectorWorkspace(workspaceId)

    const imageInfoList: ImageInfo[] = []
    imageIds.forEach(image_id => {
      ws.image.removeTag(image_id, tagId)
      const imageInfo = Globals.imageInfoList[workspaceId][image_id]
      const nextTags: string[] = []
      for (let i = 0; i < imageInfo.tags.length; i++) {
        if (imageInfo.tags[i] != tagId) nextTags.push(imageInfo.tags[i])
      }
      imageInfo.tags = nextTags
      imageInfoList.push(imageInfo)
    })

    return imageInfoList
  }

  public static async getGroupImages(workspaceId: string, groupId: string): Promise<ImageInfo[]> {
    const ws = await BackendConnectorWorkspace(workspaceId)
    const resImages = await ws.image.getGroupedImages(groupId)
    if (!resImages.images) return []

    const requestImages = resImages.images.map(image => {
      return this.resImageToImageInfo(image)
    })
    return requestImages
  }

  public static async sortGroupImages(workspaceId: string, imageIds: string[]): Promise<void> {
    const ws = await BackendConnectorWorkspace(workspaceId)
    await ws.image.patchImagesGroupSort(imageIds)
    // const groupImages = await ws.image.getGroupedImages(groupId)
    // groupImages.images?.map(image => {
    //   if (!image.is_group_thumb_nail) return

    //   Globals.imageInfoList[workspaceId][image.image_id] = image

    //   // TODO
    //   // const groupThumbChanged: GroupThumbChanged = {
    //   //   workspaceId: workspaceId,
    //   //   prevThumbImageId: currThumbImageId,
    //   //   image: image,
    //   // }
    //   // e.reply(IpcId.ToRenderer.GROUP_THUMB_CHANGED, JSON.stringify(groupThumbChanged))
    // })
  }

  private static imageSize(isThumbnail: boolean) {
    return isThumbnail ? BackendConnectorImage.IMAGE_SIZE_THUMBNAIL : BackendConnectorImage.IMAGE_SIZE_ORIGINAL
  }

  private static resImageToImageInfo(res_img: ResImage): ImageInfo {
    return {
      image_id: res_img.image_id,
      file_name: res_img.file_name,
      ext: res_img.ext,
      width: res_img.width,
      height: res_img.height,
      memo: res_img.memo,
      author: res_img.author,
      created_at: res_img.created_at,
      tags: res_img.tags,
      is_group_thumb_nail: res_img.is_group_thumb_nail,
      group_id: res_img.group_id,
    } as ImageInfo
  }
}
