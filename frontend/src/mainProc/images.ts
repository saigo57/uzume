import { ipcMain } from 'electron';
import {
  IpcId,
  ImageFiles,
  ImageInfos,
  ShowImages,
  RequestImage,
  ImageData,
} from '../ipc/images'
import BackendConnector from '../backendConnector/backendConnector';
import BackendConnectorImage from '../backendConnector/image';

ipcMain.on(IpcId.UPLOAD_IMAGES, (e, arg) => {
  let imageFiles: ImageFiles = JSON.parse(arg)

  BackendConnector.workspace(imageFiles.workspaceId, (ws) => {
    ws.image.create(imageFiles.imageFileList).then(() => {
      // TODO: uploadしたときの画面の動きは整理する必要がある
      showImagesReply(e, imageFiles.workspaceId, 1)
    });
  })
});

ipcMain.on(IpcId.SHOW_IMAGES, (e, arg) => {
  let showImages: ShowImages = JSON.parse(arg)
  showImagesReply(e, showImages.workspaceId, showImages.page)
});

ipcMain.on(IpcId.REQUEST_THUMB_IMAGE, (e, arg) => {
  let reqImage: RequestImage = JSON.parse(arg)
  getImage(e, reqImage, IpcId.REQUEST_THUMB_IMAGE_REPLY)
});

ipcMain.on(IpcId.REQUEST_ORIG_IMAGE, (e, arg) => {
  let reqImage: RequestImage = JSON.parse(arg)
  getImage(e, reqImage, IpcId.REQUEST_ORIG_IMAGE_REPLY)
});

function getImage(e: Electron.IpcMainEvent, reqImage: RequestImage, replyId: string) {
  BackendConnector.workspace(reqImage.workspaceId, (ws) => {
    ws.image.getImage(
      reqImage.imageId,
      reqImage.isThumbnail ? BackendConnectorImage.IMAGE_SIZE_THUMBNAIL : BackendConnectorImage.IMAGE_SIZE_ORIGINAL
    ).then((imageBase64) => {
      let imageData: ImageData = { imageId: reqImage.imageId, imageBase64: imageBase64  }
      e.reply(replyId, JSON.stringify(imageData));
    })
  });
}

export function showImagesReply(e: Electron.IpcMainEvent, workspaceId: string, page: number) {
  BackendConnector.workspace(workspaceId, (ws) => {
    ws.image.getList(page).then((imgList) => {
      let imageInfos: ImageInfos = { workspaceId: workspaceId, page: imgList.page, images: [] }

      for (let i = 0; i < imgList.images.length; i++) {
        imageInfos.images.push({
          image_id: imgList.images[i].image_id,
          file_name: imgList.images[i].file_name,
          ext: imgList.images[i].ext,
          memo: imgList.images[i].memo,
          author: imgList.images[i].author,
          created_at: imgList.images[i].created_at,
        });
      }

      e.reply(IpcId.SHOW_IMAGES_REPLY, JSON.stringify(imageInfos));
    });
  });
}
