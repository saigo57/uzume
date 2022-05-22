import Electron, { ipcMain } from 'electron'
import { isCurrentWorkspace } from './currWorkspace'
import {
  IpcId,
  Reflect,
  ImageFiles,
  ImageInfos,
  ShowImages,
  RequestImage,
  ImageData,
  RequestImageInfo,
  ImageInfo,
  AddTagToImage,
  RemoveTagFromImage,
  ImageUploadProgress,
} from '../ipc/images'
import { BackendConnector, Image as BackendConnectorImage } from 'uzume-backend-connector'
import { showFooterMessage } from '../ipc/footer'
import { Globals } from './globals'

const THUMB_REQUEST_LIMIT = 5

// Rendererプロセスに、Mainプロセスにイベントを送信するように依頼する
//   Main→Renderer(reflect)→Main→Rendererという流れになる
//   本当はMain→Main→Rendererとしたいが、Main→Rendererがうまく行かない
const sendReflect = (e: Electron.IpcMainEvent, replyId: string) => {
  const reflect = { replyId: replyId } as Reflect
  e.reply(IpcId.ToRenderer.REPLY_REFLECT, JSON.stringify(reflect))
}

ipcMain.on(IpcId.ToMainProc.UPLOAD_IMAGES, (e, arg) => {
  const imageFiles: ImageFiles = JSON.parse(arg)

  const imageUploaded = (finishNum: number, allNum: number) => {
    const progress = {
      completeCnt: finishNum,
      allImagesCnt: allNum,
    } as ImageUploadProgress

    e.reply(IpcId.ToRenderer.IMAGE_UPLOAD_PROGRESS, JSON.stringify(progress))
  }

  BackendConnector.workspace(imageFiles.workspaceId, ws => {
    ws.image
      .create(imageFiles.imageFileList, imageUploaded)
      .then(() => {
        // TODO: uploadしたときの画面の動きは整理する必要がある
        showImagesReply(e, imageFiles.workspaceId, 1, imageFiles.tagIds, imageFiles.searchType)
      })
      .catch(err => {
        showFooterMessage(e, `画像の登録に失敗しました。[${err}}]`)
      })
  })
})

ipcMain.on(IpcId.ToMainProc.SHOW_IMAGES, (e, arg) => {
  const showImages: ShowImages = JSON.parse(arg)
  let tags: string[] = showImages.tagIds
  if (showImages.uncategorized) tags = [...tags, '_system_tag_uncategorized']
  showImagesReply(e, showImages.workspaceId, showImages.page, tags, showImages.searchType)
})

ipcMain.on(IpcId.ToMainProc.GET_IMAGE_INFO_LIST, (e, arg) => {
  const reqImage: RequestImageInfo = JSON.parse(arg)
  const imageInfoList: ImageInfo[] = reqImage.imageIds.map(
    image_id => Globals.imageInfoList[reqImage.workspaceId][image_id]
  )
  e.reply(IpcId.ToRenderer.GET_IMAGE_INFO_LIST, JSON.stringify(imageInfoList))
})

ipcMain.on(IpcId.ToMainProc.REQUEST_THUMB_IMAGE, (e, arg) => {
  const reqImage: RequestImage = JSON.parse(arg)
  if (Globals.thumb_image_queue.length == 0) {
    sendReflect(e, IpcId.ACTUAL_REQUEST_THUMB_IMAGE)
  }

  Globals.thumb_image_queue.push(reqImage)
})

ipcMain.on(IpcId.ACTUAL_REQUEST_THUMB_IMAGE, (e, _arg) => {
  // 現在のworkspace以外のリクエストが残っている場合削除する
  const next_queue = []
  for (let i = 0; i < Globals.thumb_image_queue.length; i++) {
    if (!isCurrentWorkspace(Globals.thumb_image_queue[i].workspaceId)) continue

    next_queue.push(Globals.thumb_image_queue[i])
  }
  Globals.thumb_image_queue = next_queue

  // n枚バックエンドに要求する
  for (let i = 0; i < THUMB_REQUEST_LIMIT; i++) {
    const reqImage = Globals.thumb_image_queue.shift()
    if (reqImage) getImage(e, reqImage, IpcId.ToRenderer.REQUEST_THUMB_IMAGE)
  }

  // queueが残っていたら再度この処理を呼ぶ
  if (Globals.thumb_image_queue.length > 0) {
    sendReflect(e, IpcId.ACTUAL_REQUEST_THUMB_IMAGE)
  }
})

ipcMain.on(IpcId.ToMainProc.REQUEST_ORIG_IMAGE, (e, arg) => {
  const reqImage: RequestImage = JSON.parse(arg)
  if (!reqImage.imageId) return
  getImage(e, reqImage, IpcId.ToRenderer.REQUEST_ORIG_IMAGE)
})

ipcMain.on(IpcId.ToMainProc.ADD_TAG, (e, arg) => {
  const addTagToImage: AddTagToImage = JSON.parse(arg)
  addTagToImages(e, addTagToImage.workspaceId, addTagToImage.imageIds, addTagToImage.tagId)
})

ipcMain.on(IpcId.ToMainProc.REMOVE_TAG, (e, arg) => {
  const removeTagFromImage: RemoveTagFromImage = JSON.parse(arg)

  BackendConnector.workspace(removeTagFromImage.workspaceId, ws => {
    const imageInfoList: ImageInfo[] = []
    removeTagFromImage.imageIds.forEach(image_id => {
      ws.image.removeTag(image_id, removeTagFromImage.tagId).catch(err => {
        showFooterMessage(e, `タグの削除に失敗しました。[${err}}]`)
      })
      const imageInfo = Globals.imageInfoList[removeTagFromImage.workspaceId][image_id]
      const newTags: string[] = []
      for (let i = 0; i < imageInfo.tags.length; i++) {
        if (imageInfo.tags[i] != removeTagFromImage.tagId) newTags.push(imageInfo.tags[i])
      }
      imageInfo.tags = newTags
      imageInfoList.push(imageInfo)
    })

    afterUpdateImageInfo(e, imageInfoList)
  })
})

function getImage(e: Electron.IpcMainEvent, reqImage: RequestImage, replyId: string) {
  BackendConnector.workspace(reqImage.workspaceId, ws => {
    ws.image
      .getImage(
        reqImage.imageId,
        reqImage.isThumbnail ? BackendConnectorImage.IMAGE_SIZE_THUMBNAIL : BackendConnectorImage.IMAGE_SIZE_ORIGINAL
      )
      .then(imageBase64 => {
        const imageData: ImageData = {
          imageId: reqImage.imageId,
          imageBase64: imageBase64,
        }
        e.reply(replyId, JSON.stringify(imageData))
      })
      .catch(_err => {
        // TODO: 現状機能的には問題なくてもエラーになってしまうため、エラーメッセージは出さない
        // 複数回同じ画像をリクエストしているのが関係指定層
        // showFooterMessage(e, `画像の取得に失敗しました。[${err}}]`);
      })
  })
}

export function showImagesReply(
  e: Electron.IpcMainEvent,
  workspaceId: string,
  page: number,
  tagIds: string[],
  searchType: string
) {
  BackendConnector.workspace(workspaceId, ws => {
    ws.image
      .getList(page, tagIds, searchType)
      .then(imgList => {
        const imageInfos: ImageInfos = {
          workspaceId: workspaceId,
          page: imgList.page,
          images: [],
        }

        if (imgList.images != null) {
          for (let i = 0; i < imgList.images.length; i++) {
            const imageInfo: ImageInfo = {
              image_id: imgList.images[i].image_id,
              file_name: imgList.images[i].file_name,
              ext: imgList.images[i].ext,
              width: imgList.images[i].width,
              height: imgList.images[i].height,
              memo: imgList.images[i].memo,
              author: imgList.images[i].author,
              created_at: imgList.images[i].created_at,
              tags: imgList.images[i].tags,
            }

            imageInfos.images.push(imageInfo)

            if (!(workspaceId in Globals.imageInfoList)) Globals.imageInfoList[workspaceId] = {}
            Globals.imageInfoList[workspaceId][imageInfo.image_id] = imageInfo
          }
        }

        e.reply(IpcId.ToRenderer.SHOW_IMAGES, JSON.stringify(imageInfos))
      })
      .catch(err => {
        showFooterMessage(e, `画像リストの取得に失敗しました。[${err}}]`)
      })
  })
}

export function addTagToImages(e: Electron.IpcMainEvent, workspaceId: string, imageIds: string[], tagId: string) {
  BackendConnector.workspace(workspaceId, ws => {
    const imageInfoList: ImageInfo[] = []
    for (let i = 0; i < imageIds.length; i++) {
      const imageInfo = Globals.imageInfoList[workspaceId][imageIds[i]]
      if (imageInfo.tags.includes(tagId)) continue // 既に付与されていたらスキップする

      ws.image.addTag(imageIds[i], tagId).catch(err => {
        showFooterMessage(e, `タグの付与に失敗しました。[${err}}]`)
      })
      imageInfo.tags.push(tagId)
      imageInfoList.push(imageInfo)
    }

    afterUpdateImageInfo(e, imageInfoList)
  })
}

function afterUpdateImageInfo(e: Electron.IpcMainEvent, imageInfoList: ImageInfo[]) {
  e.reply(IpcId.ToRenderer.UPDATE_IMAGE_INFO, JSON.stringify(imageInfoList))
  e.reply(IpcId.ToRenderer.IMAGE_INFO_LIST_UPDATED, JSON.stringify(imageInfoList))
}
