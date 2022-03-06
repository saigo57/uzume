import Electron, { ipcMain } from 'electron';
import { isCurrentWorkspace } from './currWorkspace';
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
} from '../ipc/images';
import BackendConnector from '../backendConnector/backendConnector';
import BackendConnectorImage from '../backendConnector/image';
import { showFooterMessage } from '../ipc/footer';

const THUMB_REQUEST_LIMIT = 5

type ImageInfoMap = { [key: string]: ImageInfo }
let g_imageInfoList: { [key: string]: ImageInfoMap } = {}
let g_thumb_image_queue = [] as RequestImage[]

// Rendererプロセスに、Mainプロセスにイベントを送信するように依頼する
//   Main→Renderer(reflect)→Main→Rendererという流れになる
//   本当はMain→Main→Rendererとしたいが、Main→Rendererがうまく行かない
const sendReflect = (e: Electron.IpcMainEvent, replyId: string) => {
  let reflect = { replyId: replyId } as Reflect
  e.reply(IpcId.REPLY_REFLECT, JSON.stringify(reflect))
}

ipcMain.on(IpcId.UPLOAD_IMAGES, (e, arg) => {
  let imageFiles: ImageFiles = JSON.parse(arg)

  const imageUploaded = (finishNum: number, allNum: number) => {
    let progress = {
      completeCnt: finishNum,
      allImagesCnt: allNum,
    } as ImageUploadProgress

    e.reply(IpcId.IMAGE_UPLOAD_PROGRESS_REPLY, JSON.stringify(progress))
  };

  BackendConnector.workspace(imageFiles.workspaceId, (ws) => {
    ws.image.create(imageFiles.imageFileList, imageUploaded).then(() => {
      // TODO: uploadしたときの画面の動きは整理する必要がある
      showImagesReply(e, imageFiles.workspaceId, 1, imageFiles.tagIds, imageFiles.searchType)
    }).catch((err) => {
      showFooterMessage(e, `画像の登録に失敗しました。[${err}}]`);
    });
  })
});

ipcMain.on(IpcId.SHOW_IMAGES, (e, arg) => {
  let showImages: ShowImages = JSON.parse(arg)
  let tags: string[] = showImages.tagIds;
  if ( showImages.uncategorized ) tags = [...tags, '_system_tag_uncategorized']
  showImagesReply(e, showImages.workspaceId, showImages.page, tags, showImages.searchType)
});

ipcMain.on(IpcId.GET_IMAGE_INFO_LIST, (e, arg) => {
  let reqImage: RequestImageInfo = JSON.parse(arg)
  let imageInfoList: ImageInfo[] = reqImage.imageIds.map(
    (image_id) => g_imageInfoList[reqImage.workspaceId][image_id]
  );
  e.reply(IpcId.GET_IMAGE_INFO_LIST_REPLY, JSON.stringify(imageInfoList));
});

ipcMain.on(IpcId.REQUEST_THUMB_IMAGE, (e, arg) => {
  let reqImage: RequestImage = JSON.parse(arg)
  if ( g_thumb_image_queue.length == 0 ) {
    sendReflect(e, IpcId.ACTUAL_REQUEST_THUMB_IMAGE)
  }

  g_thumb_image_queue.push(reqImage)
});

ipcMain.on(IpcId.ACTUAL_REQUEST_THUMB_IMAGE, (e, arg) => {
  // 現在のworkspace以外のリクエストが残っている場合削除する
  let next_queue = []
  for (let i = 0; i < g_thumb_image_queue.length; i++) {
    if ( !isCurrentWorkspace(g_thumb_image_queue[i].workspaceId) ) continue;

    next_queue.push(g_thumb_image_queue[i])
  }
  g_thumb_image_queue = next_queue;

  // n枚バックエンドに要求する
  for (let i = 0; i < THUMB_REQUEST_LIMIT; i++) {
    let reqImage = g_thumb_image_queue.shift()
    if ( reqImage ) getImage(e, reqImage, IpcId.REQUEST_THUMB_IMAGE_REPLY)
  }

  // queueが残っていたら再度この処理を呼ぶ
  if ( g_thumb_image_queue.length > 0 ) {
    sendReflect(e, IpcId.ACTUAL_REQUEST_THUMB_IMAGE)
  }
});

ipcMain.on(IpcId.REQUEST_ORIG_IMAGE, (e, arg) => {
  let reqImage: RequestImage = JSON.parse(arg)
  if ( !reqImage.imageId ) return;
  getImage(e, reqImage, IpcId.REQUEST_ORIG_IMAGE_REPLY)
});

ipcMain.on(IpcId.ADD_TAG, (e, arg) => {
  let addTagToImage: AddTagToImage = JSON.parse(arg)
  addTagToImages(e, addTagToImage.workspaceId, addTagToImage.imageIds, addTagToImage.tagId)
});

ipcMain.on(IpcId.REMOVE_TAG, (e, arg) => {
  let removeTagFromImage: RemoveTagFromImage = JSON.parse(arg)

  BackendConnector.workspace(removeTagFromImage.workspaceId, (ws) => {
    let imageInfoList: ImageInfo[] = []
    removeTagFromImage.imageIds.forEach((image_id) => {
      ws.image.removeTag(image_id, removeTagFromImage.tagId).catch((err) => {
        showFooterMessage(e, `タグの削除に失敗しました。[${err}}]`);
      });
      let imageInfo = g_imageInfoList[removeTagFromImage.workspaceId][image_id];
      let newTags: string[] = []
      for (let i = 0; i < imageInfo.tags.length; i++) {
        if ( imageInfo.tags[i] != removeTagFromImage.tagId ) newTags.push(imageInfo.tags[i]);
      }
      imageInfo.tags = newTags;
      imageInfoList.push(imageInfo);
    });

    afterUpdateImageInfo(e, imageInfoList)
  });
});

function getImage(e: Electron.IpcMainEvent, reqImage: RequestImage, replyId: string) {
  BackendConnector.workspace(reqImage.workspaceId, (ws) => {
    ws.image.getImage(
      reqImage.imageId,
      reqImage.isThumbnail ? BackendConnectorImage.IMAGE_SIZE_THUMBNAIL : BackendConnectorImage.IMAGE_SIZE_ORIGINAL
    ).then((imageBase64) => {
      let imageData: ImageData = { imageId: reqImage.imageId, imageBase64: imageBase64  }
      e.reply(replyId, JSON.stringify(imageData));
    }).catch((err) => {
      // TODO: 現状機能的には問題なくてもエラーになってしまうため、エラーメッセージは出さない
      // 複数回同じ画像をリクエストしているのが関係指定層
      // showFooterMessage(e, `画像の取得に失敗しました。[${err}}]`);
    })
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
    }).catch((err) => {
      showFooterMessage(e, `画像リストの取得に失敗しました。[${err}}]`);
    });
  });
}

export function addTagToImages(e: Electron.IpcMainEvent, workspaceId: string, imageIds: string[], tagId: string) {
  BackendConnector.workspace(workspaceId, (ws) => {
    let imageInfoList: ImageInfo[] = []
    for (let i = 0; i < imageIds.length; i++) {
      let imageInfo = g_imageInfoList[workspaceId][imageIds[i]];
      if ( imageInfo.tags.includes(tagId) ) continue; // 既に付与されていたらスキップする

      ws.image.addTag(imageIds[i], tagId).catch((err) => {
        showFooterMessage(e, `タグの付与に失敗しました。[${err}}]`);
      })
      imageInfo.tags.push(tagId)
      imageInfoList.push(imageInfo)
    }

    afterUpdateImageInfo(e, imageInfoList)
  });
}

function afterUpdateImageInfo(e: Electron.IpcMainEvent, imageInfoList :ImageInfo[]) {
  e.reply(IpcId.UPDATE_IMAGE_INFO_REPLY, JSON.stringify(imageInfoList));
  e.reply(IpcId.IMAGE_INFO_LIST_UPDATED_REPLY, JSON.stringify(imageInfoList));
}
