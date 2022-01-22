import { ipcMain } from 'electron';
import {
  IpcId,
  ImageFiles,
  ImageInfos,
  ShowImages,
  RequestImage,
  ImageData,
  RequestImageInfo,
  ImageInfo,
  AddTagToImage,
  RemoveTagFromImage,
} from '../ipc/images'
import BackendConnector from '../backendConnector/backendConnector';
import BackendConnectorImage from '../backendConnector/image';

type ImageInfoMap = { [key: string]: ImageInfo }
let g_imageInfoList: { [key: string]: ImageInfoMap } = {}

ipcMain.on(IpcId.UPLOAD_IMAGES, (e, arg) => {
  let imageFiles: ImageFiles = JSON.parse(arg)

  BackendConnector.workspace(imageFiles.workspaceId, (ws) => {
    ws.image.create(imageFiles.imageFileList).then(() => {
      // TODO: uploadしたときの画面の動きは整理する必要がある
      showImagesReply(e, imageFiles.workspaceId, 1, imageFiles.tagIds, imageFiles.searchType)
    });
  })
});

ipcMain.on(IpcId.SHOW_IMAGES, (e, arg) => {
  let showImages: ShowImages = JSON.parse(arg)
  let tags: string[] = showImages.tagIds;
  if ( showImages.uncategorized ) tags = [...tags, '_system_tag_uncategorized']
  showImagesReply(e, showImages.workspaceId, showImages.page, tags, showImages.searchType)
});

ipcMain.on(IpcId.GET_IMAGE_INFO, (e, arg) => {
  let reqImage: RequestImageInfo = JSON.parse(arg)
  let imageInfo = g_imageInfoList[reqImage.workspaceId][reqImage.imageId]
  e.reply(IpcId.GET_IMAGE_INFO_REPLY, JSON.stringify(imageInfo));
});

ipcMain.on(IpcId.REQUEST_THUMB_IMAGE, (e, arg) => {
  let reqImage: RequestImage = JSON.parse(arg)
  getImage(e, reqImage, IpcId.REQUEST_THUMB_IMAGE_REPLY)
});

ipcMain.on(IpcId.REQUEST_ORIG_IMAGE, (e, arg) => {
  let reqImage: RequestImage = JSON.parse(arg)
  getImage(e, reqImage, IpcId.REQUEST_ORIG_IMAGE_REPLY)
});

ipcMain.on(IpcId.ADD_TAG, (e, arg) => {
  let addTagToImage: AddTagToImage = JSON.parse(arg)
  addTagToImages(e, addTagToImage.workspaceId, addTagToImage.imageIds, addTagToImage.tagId)
});

ipcMain.on(IpcId.REMOVE_TAG, (e, arg) => {
  let removeTagFromImage: RemoveTagFromImage = JSON.parse(arg)

  BackendConnector.workspace(removeTagFromImage.workspaceId, (ws) => {
    ws.image.removeTag(removeTagFromImage.imageId, removeTagFromImage.tagId)
    let imageInfo = g_imageInfoList[removeTagFromImage.workspaceId][removeTagFromImage.imageId]
    let newTags: string[] = []
    for (let i = 0; i < imageInfo.tags.length; i++) {
      if ( imageInfo.tags[i] != removeTagFromImage.tagId ) newTags.push(imageInfo.tags[i]);
    }
    imageInfo.tags = newTags;
    afterUpdateImageInfo(e, [imageInfo])
  });
});

function getImage(e: Electron.IpcMainEvent, reqImage: RequestImage, replyId: string) {
  BackendConnector.workspace(reqImage.workspaceId, (ws) => {
    let retry = 0;
    while ( true ) {
      ws.image.getImage(
        reqImage.imageId,
        reqImage.isThumbnail ? BackendConnectorImage.IMAGE_SIZE_THUMBNAIL : BackendConnectorImage.IMAGE_SIZE_ORIGINAL
      ).then((imageBase64) => {
        let imageData: ImageData = { imageId: reqImage.imageId, imageBase64: imageBase64  }
        e.reply(replyId, JSON.stringify(imageData));
      }).catch((err) => {
        retry++;
      })

      if ( retry == 0 || retry > 5 ) break;
    }
  });
}

export function showImagesReply(
  e: Electron.IpcMainEvent, workspaceId: string, page: number,
  tagIds: string[], searchType: string) {
  BackendConnector.workspace(workspaceId, (ws) => {
    ws.image.getList(page, tagIds, searchType).then((imgList) => {
      let imageInfos: ImageInfos = { workspaceId: workspaceId, page: imgList.page, images: [] }

      if ( imgList.images != null ) {
        for (let i = 0; i < imgList.images.length; i++) {
          let imageInfo: ImageInfo = {
            image_id: imgList.images[i].image_id,
            file_name: imgList.images[i].file_name,
            ext: imgList.images[i].ext,
            width: imgList.images[i].width,
            height: imgList.images[i].height,
            memo: imgList.images[i].memo,
            author: imgList.images[i].author,
            created_at: imgList.images[i].created_at,
            tags: imgList.images[i].tags,
          };

          imageInfos.images.push(imageInfo);

          if ( !(workspaceId in g_imageInfoList) ) g_imageInfoList[workspaceId] = {};
          g_imageInfoList[workspaceId][imageInfo.image_id] = imageInfo;
        }
      }

      e.reply(IpcId.SHOW_IMAGES_REPLY, JSON.stringify(imageInfos));
    });
  });
}

export function addTagToImages(e: Electron.IpcMainEvent, workspaceId: string, imageIds: string[], tagId: string) {
  BackendConnector.workspace(workspaceId, (ws) => {
    let imageInfoList: ImageInfo[] =[]
    for (let i = 0; i < imageIds.length; i++) {
      ws.image.addTag(imageIds[i], tagId)
      g_imageInfoList[workspaceId][imageIds[i]].tags.push(tagId)
      imageInfoList.push(g_imageInfoList[workspaceId][imageIds[i]])
    }

    afterUpdateImageInfo(e, imageInfoList)
  });
}

function afterUpdateImageInfo(e: Electron.IpcMainEvent, imageInfoList :ImageInfo[]) {
  e.reply(IpcId.UPDATE_IMAGE_INFO_REPLY, JSON.stringify(imageInfoList));
  e.reply(IpcId.IMAGE_INFO_UPDATED_REPLY, JSON.stringify(imageInfoList));
}
