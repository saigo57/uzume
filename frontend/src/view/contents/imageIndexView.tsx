import React, { useState, useEffect} from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import {
  IpcId as ImagesIpcId,
  ImageFiles,
  ImageInfo,
  ImageInfos,
  ShowImages,
  RequestImage,
  ImageData,
} from '../../ipc/images'

type ImageIndexViewProps = {
  workspaceId: string
};

export const ImageIndexView:React.VFC<ImageIndexViewProps> = (props) => {
  const [isDragOverState, setIsDragOver] = useState(false);
  const [imageInfoState, setImageInfo] = useState([] as ImageInfo[]);

  useEffect(() => {
    if ( props.workspaceId.length > 0 ) {
      const showImages: ShowImages = { workspaceId: props.workspaceId }
      window.api.send(ImagesIpcId.SHOW_IMAGES, JSON.stringify(showImages));
    }
  }, [props.workspaceId]);

  useEffect(() => {
    window.api.on(ImagesIpcId.SHOW_IMAGES_REPLY, (_e, arg) => {
      let imageInfos = JSON.parse(arg) as ImageInfos
      setImageInfo(imageInfos.images)

      imageInfos.images.forEach((image) => {
        let reqImage: RequestImage = {
          workspaceId: imageInfos.workspaceId,
          imageId: image.image_id,
          isThumbnail: true,
        }
        window.api.send(ImagesIpcId.REQUEST_IMAGE, JSON.stringify(reqImage));
      });
    });
  }, []);

  useEffect(() => {
    window.api.on(ImagesIpcId.REQUEST_IMAGE_REPLY, (_e, arg) => {
      let imageData = JSON.parse(arg) as ImageData

      let img: any = document.getElementById(`image-${imageData.imageId}`);
      if ( img ) {
        img.src = "data:image/jpg;base64," + imageData.imageBase64;
      }
    });
  }, []);

  const handleDragOver = (e: any) => {
    e.stopPropagation();
    e.preventDefault();

    setIsDragOver(true);
  };

  const handleDragLeave = (e: any) => {
    e.stopPropagation();
    e.preventDefault();

    setIsDragOver(false);
  };

  const handleDrop = (e: any) => {
    e.stopPropagation();
    e.preventDefault();
    setIsDragOver(false);

    let imageFiles: ImageFiles = { workspaceId: props.workspaceId, imageFileList: [] }
    for (let i = 0; i < e.dataTransfer.files.length; i++) {
      imageFiles.imageFileList.push(e.dataTransfer.files[i].path);
    }

    window.api.send(ImagesIpcId.UPLOAD_IMAGES, JSON.stringify(imageFiles));
  };

  return (
    <div className={`thumbnail-area ${isDragOverState ? 'drag-over' : ''}`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} >
      {
        imageInfoState.map((image) => {
          return (
            <div className="thumbnail">
              <img id={`image-${image.image_id}`}></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
          )
        })
      }
    </div>
  );
}
