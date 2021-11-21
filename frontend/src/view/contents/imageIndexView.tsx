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
  onChangeSelectedImages: (imageIds: string[]) => void
  onImageDoubleClick: (imageId: string) => void
  hide: boolean
};

type ImageList = {
  page: number
  images: ImageInfo[]
}

export const ImageIndexView:React.VFC<ImageIndexViewProps> = (props) => {
  const [isDragOverState, setIsDragOver] = useState(false);
  const [imageList, setImageList] = useState({page: 0, images: []} as ImageList);
  const [nextPageRequestableState, setNextPageRequestable] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState([] as string[]);

  useEffect(() => {
    if ( props.workspaceId.length > 0 ) {
      setImageList({images: [], page: 0 })
      setNextPageRequestable(false)
      requestShowImages(1)
    }
  }, [props.workspaceId]);

  useEffect(() => {
    if ( imageList.page > 0 ) setNextPageRequestable(true)
  }, [imageList.page]);

  useEffect(() => {
    window.api.on(ImagesIpcId.SHOW_IMAGES_REPLY, (_e, arg) => {
      let rcvImageInfos = JSON.parse(arg) as ImageInfos

      if ( rcvImageInfos.images.length == 0 ) {
        setNextPageRequestable(false);
        return;
      }

      setImageList(prevState => {
        const requestImage = (newImages: ImageInfo[]) =>{
          newImages.forEach((image) => {
            let reqImage: RequestImage = {
              workspaceId: rcvImageInfos.workspaceId,
              imageId: image.image_id,
              isThumbnail: true,
            }
            window.api.send(ImagesIpcId.REQUEST_THUMB_IMAGE, JSON.stringify(reqImage));
          });
        }

        if ( rcvImageInfos.page == 1 ) {
          // TODO:スクロール量もリセットする必要あり？
          requestImage(rcvImageInfos.images)
          return {
            images: rcvImageInfos.images,
            page: 1,
          }
        }

        let addImages: ImageInfo[] = []
        var currImages: { [image_id: string]: boolean; } = {};
        for (let i = 0; i < prevState.images.length; i++) {
          currImages[prevState.images[i].image_id] = true
        }
        for (let i = 0; i < rcvImageInfos.images.length; i++) {
          if ( rcvImageInfos.images[i].image_id in currImages ) continue;
          addImages.push(rcvImageInfos.images[i]);
        }

        requestImage(addImages)
        return {
          images: [...prevState.images, ...addImages],
          page: rcvImageInfos.page,
        }
      });
    });
  }, []);

  useEffect(() => {
    window.api.on(ImagesIpcId.REQUEST_THUMB_IMAGE_REPLY, (_e, arg) => {
      let imageData = JSON.parse(arg) as ImageData

      let img: any = document.getElementById(`image-${imageData.imageId}`);
      if ( img ) {
        img.src = "data:image;base64," + imageData.imageBase64;
      }
    });
  }, []);

  useEffect(() => {
    window.api.on(ImagesIpcId.UPDATE_IMAGE_INFO_REPLY, (_e, arg) => {
      const imageInfoList = JSON.parse(arg) as ImageInfo[]
      imageInfoList.forEach((img) => {
        for (let i = 0; i < imageList.images.length; i++) {
          if ( imageList.images[i].image_id == img.image_id ) {
            imageList.images[i] = img
          }
        }
      });
    });
  }, []);

  const requestShowImages = (page: number) => {
    const showImages: ShowImages = { workspaceId: props.workspaceId, page: page }
    window.api.send(ImagesIpcId.SHOW_IMAGES, JSON.stringify(showImages));
  };

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

  const onThumbnailAreaClick = () => {
    updateSelectImages([])
  };

  const onImageClick = (e:any, imageId: string) => {
    e.stopPropagation();
    e.preventDefault();
    updateSelectImages([imageId])
  };

  const updateSelectImages = (imageIds: string[]) => {
    setSelectedImageId(imageIds)
    if ( props.onChangeSelectedImages ) props.onChangeSelectedImages(imageIds)
  }

  // 無限スクロール発火の監視
  const ref = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if ( nextPageRequestableState ) {
            setNextPageRequestable(false)
            requestShowImages(imageList.page + 1)
          }
        }
      },
      { threshold: 0.5 },
    );
    if (ref.current === null) return;
    observer.unobserve(ref.current)
    if ( nextPageRequestableState ) observer.observe(ref.current);
  });

  return (
    <div
      className={`thumbnail-area ${isDragOverState ? 'drag-over' : ''} ${props.hide ? 'hide' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={onThumbnailAreaClick}
    >
      {
        imageList.images.map((image) => {
          return (
            <div className={`thumbnail ${selectedImageId.includes(image.image_id) ? 'selected' : ''}`}
              onClick={(e)=>{ onImageClick(e, image.image_id) }}
              onDoubleClick={()=>{ if ( props.onImageDoubleClick ) props.onImageDoubleClick(image.image_id); }}
            >
              <img id={`image-${image.image_id}`}></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
          )
        })
      }
      {(()=>{
        if ( nextPageRequestableState ) {
          return (<div id="infinite-scroll-end-marker" ref={ref} ></div>);
        } else {
          return;
        }
      })()}
    </div>
  );
}
