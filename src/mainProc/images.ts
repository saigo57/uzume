import * as fs from 'fs'
import Electron, { ipcMain, BrowserWindow, dialog, Menu } from 'electron'
import {
  IpcId,
  ShowContextMenu,
  FetchImage,
  ImageFiles,
  ImageInfos,
  ShowImages,
  RequestImage,
  AddTagToImage,
  RemoveTagFromImage,
  SortGroupImages,
  ImageUploadProgress,
} from '../ipc/images'
import { BackendConnector } from 'uzume-backend-connector'
import ImageUseCase from './useCase/imageUseCase'
import { showFooterMessage } from '../ipc/footer'
import { Globals } from './globals'

function base64decode(data:string){
  return new Uint8Array([...atob(data)].map(s => s.charCodeAt(0)));
}

ipcMain.handle(IpcId.Invoke.FETCH_IMAGE, async (e, arg) => {
  const fetchImage: FetchImage = JSON.parse(arg)
  const imageData = await ImageUseCase.fetchImage(fetchImage.workspaceId, fetchImage.imageId, fetchImage.isThumbnail)

  return JSON.stringify(imageData)
})

ipcMain.handle(IpcId.Invoke.UPLOAD_IMAGES, async (e, arg) => {
  const imageFiles: ImageFiles = JSON.parse(arg)

  const imageUploaded = (finishNum: number, allNum: number) => {
    const progress = {
      completeCnt: finishNum,
      allImagesCnt: allNum,
    } as ImageUploadProgress

    e.sender.send(IpcId.ToRenderer.IMAGE_UPLOAD_PROGRESS, JSON.stringify(progress))
  }

  try {
    await ImageUseCase.uploadImages(imageFiles.workspaceId, imageFiles.imageFileList, imageUploaded)
  } catch (err) {
    showFooterMessage(e, `画像の登録に失敗しました。[${err}]`)
  }
})

ipcMain.handle(IpcId.Invoke.FETCH_IMAGE_LIST, async (e, arg) => {
  const showImages: ShowImages = JSON.parse(arg)
  let tags: string[] = showImages.tagIds
  if (showImages.uncategorized) tags = [...tags, '_system_tag_uncategorized']
  try {
    const imageInfos: ImageInfos = await ImageUseCase.fetchImageList(
      showImages.workspaceId,
      showImages.page,
      tags,
      showImages.searchType
    )

    return JSON.stringify(imageInfos)
  } catch (err) {
    showFooterMessage(e, `画像リストの取得に失敗しました。[${err}]`)
  }
})

ipcMain.handle(IpcId.Invoke.REQUEST_GROUP_IMAGE_INFO_LIST, async (e, arg) => {
  const reqImage: RequestImage = JSON.parse(arg)
  if (!reqImage.imageId) return null

  const image = Globals.imageInfoList[reqImage.workspaceId][reqImage.imageId]
  if (image.is_group_thumb_nail) {
    const images = await ImageUseCase.getGroupImages(reqImage.workspaceId, image.group_id)
    return JSON.stringify(images)
  } else {
    return JSON.stringify([image])
  }
})

ipcMain.handle(IpcId.Invoke.ADD_TAG, async (e, arg) => {
  const addTagToImage: AddTagToImage = JSON.parse(arg)
  const imageInfoList = await ImageUseCase.addTagToImages(
    addTagToImage.workspaceId,
    addTagToImage.imageIds,
    addTagToImage.tagId
  )
  return JSON.stringify(imageInfoList)
})

ipcMain.handle(IpcId.Invoke.REMOVE_TAG, async (e, arg) => {
  const removeTagFromImage: RemoveTagFromImage = JSON.parse(arg)
  const imageInfoList = await ImageUseCase.removeTagToImages(
    removeTagFromImage.workspaceId,
    removeTagFromImage.imageIds,
    removeTagFromImage.tagId
  )
  return JSON.stringify(imageInfoList)
})

ipcMain.handle(IpcId.Invoke.SORT_GROUP_IMAGES, async (e, arg) => {
  const req: SortGroupImages = JSON.parse(arg)
  await ImageUseCase.sortGroupImages(req.workspaceId, req.imageIds)
})

ipcMain.on(IpcId.ImageContextMenu.SHOW_CONTEXT_MENU, (e, arg) => {
  const msg: ShowContextMenu = JSON.parse(arg)
  const template: (Electron.MenuItemConstructorOptions | Electron.MenuItem)[] = []

  if (msg.imageIds.length == 1) {
    const image = Globals.imageInfoList[msg.workspaceId][msg.imageIds[0]]

    if (image.is_group_thumb_nail) {
      template.push({
        label: 'グループ解除',
        click: () => {
          BackendConnector.workspace(msg.workspaceId, ws => {
            ws.image.deleteImagesFromGroup(image.group_id).then(() => {
              e.reply(IpcId.ImageContextMenu.RELOAD_IMAGES)
            })
          })
        },
      })
    }

    template.push({
      label: 'ダウンロード',
      click: async () => {
        const ret = await dialog.showSaveDialog(
          null as any,
          {
            properties: ['createDirectory', 'showOverwriteConfirmation'],
            filters: [
              {
                name: '',
                extensions: [image.ext],
              }
            ],
            defaultPath: image.file_name,
          }
        );

        if (ret.canceled) return;

        const imageData = await ImageUseCase.fetchImage(msg.workspaceId, image.image_id, false)
        const imageByteData = base64decode(imageData.imageBase64);
        fs.writeFile(ret.filePath, imageByteData, (error: any) => {
          if (error != null) {
            console.log(error)
          }
        })
      },
    })
  }

  if (msg.imageIds.length >= 2) {
    template.push({
      label: 'グループ化',
      click: () => {
        BackendConnector.workspace(msg.workspaceId, ws => {
          ws.image.addImagesToGroup(msg.imageIds).then(_imgList => {
            e.reply(IpcId.ImageContextMenu.RELOAD_IMAGES)
          })
        })
      },
    })
  }

  const menu = Menu.buildFromTemplate(template)
  const contents: any = BrowserWindow.fromWebContents(e.sender)
  menu.popup(contents)
})
