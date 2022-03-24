import React, { useState, useEffect} from 'react';
import ReactModal from "react-modal";
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
  ImageUploadProgress,
} from '../../ipc/images';
import CssConst from "./../cssConst";

type ImageIndexViewProps = {
  workspaceId: string
  onChangeSelectedImages: (imageIds: string[]) => void
  onImageDoubleClick: (imageId: string) => void
  clearSearchTags: () => void,
  hide: boolean
  tagIds: string[]
  searchType: string
  uncategorized: boolean
};

type ImageList = {
  page: number
  images: ImageInfo[]
}

type Point = {
  x: number,
  y: number,
}

type Preview = {
  isDisplay: boolean
  isFlagBreak: boolean
  startingPos: Point
}

type UploadModalInfo = {
  completeCnt: number
  allImagesCnt: number
}

export const ImageIndexView:React.VFC<ImageIndexViewProps> = (props) => {
  const [isDragOverState, setIsDragOver] = useState(false);
  const [imageList, setImageList] = useState({page: 0, images: []} as ImageList);
  const [nextPageRequestableState, setNextPageRequestable] = useState(false);
  const [lastClickImageId, setLastClickImageId] = useState("");
  const [selectedImageId, setSelectedImageId] = useState([] as string[]);
  const [preview, setPreview] = useState({isDisplay: false, isFlagBreak: false, startingPos: {x: 0, y: 0}} as Preview);
  const [isShowImageUploadModal, setIsShowImageUploadModal] = useState(false);
  const [uploadModalInfo, setUploadModalInfo] = useState({ completeCnt: 0, allImagesCnt: 0 } as UploadModalInfo);

  // TODO: どこで持つべきか(少なくともここではなさそう)
  const supportedExts = ["jpeg", "jpg", "png"];

  useEffect(() => {
    if ( props.workspaceId.length > 0 ) {
      setImageList({images: [], page: 0 })
      setNextPageRequestable(false)
      requestShowImages(1)
    }
  }, [props.workspaceId, props.uncategorized]);

  useEffect(() => {
    if ( imageList.page > 0 ) setNextPageRequestable(true)
  }, [imageList.page]);

  useEffect(() => {
    if ( props.onChangeSelectedImages ) props.onChangeSelectedImages(selectedImageId)
  }, [selectedImageId]);

  useEffect(() => {
    window.api.on(ImagesIpcId.SHOW_IMAGES_REPLY, (_e, arg) => {
      let rcvImageInfos = JSON.parse(arg) as ImageInfos
      setSelectedImageId([])

      if ( rcvImageInfos.images.length == 0 ) {
        if ( rcvImageInfos.page == 1 ) setImageList({page: 1, images: []})
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

  useEffect(() => {
    window.api.on(ImagesIpcId.REQUEST_ORIG_IMAGE_REPLY, (_e, arg) => {
      let imageData = JSON.parse(arg) as ImageData
      let imgPreview: any = document.getElementById("image-preview");
      if ( imgPreview ) {
        imgPreview.src = "data:image;base64," + imageData.imageBase64;
      }
    });
  }, []);

  useEffect(() => {
    window.api.on(ImagesIpcId.IMAGE_UPLOAD_PROGRESS_REPLY, (_e, arg) => {
      let progress = JSON.parse(arg) as ImageUploadProgress
      if ( progress.completeCnt < progress.allImagesCnt ) {
        setUploadModalInfo({completeCnt: progress.completeCnt, allImagesCnt: progress.allImagesCnt })
      } else {
        props.clearSearchTags()
        setIsShowImageUploadModal(false)
      }
    });
  }, []);

  useEffect(() => {
    let thumbnailArea: any = document.getElementById('thumbnail-area');
    thumbnailArea.addEventListener('mousemove', onMousemove);

    return () => {
      thumbnailArea.removeEventListener('mousemove', onMousemove);
    };
  });

  const requestShowImages = (page: number) => {
    const showImages: ShowImages = {
      workspaceId: props.workspaceId,
      page: page,
      tagIds: props.tagIds,
      searchType: props.searchType,
      uncategorized: props.uncategorized,
    }
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
    if ( e.dataTransfer.files.length == 0 ) return;

    let imageFiles: ImageFiles = {
      workspaceId: props.workspaceId,
      imageFileList: [],
      tagIds: props.tagIds,
      searchType: props.searchType,
    }
    for (let i = 0; i < e.dataTransfer.files.length; i++) {
      let filePath = e.dataTransfer.files[i].path;
      let ext = filePath.split('.').pop();
      if ( !supportedExts.includes(ext) ) {
        window.showConfirmModal(`未対応のファイル形式です。\n一括登録の場合すべてキャンセルされます。\n${filePath}`)
        return
      }

      imageFiles.imageFileList.push(filePath);
    }

    setIsShowImageUploadModal(true)
    setUploadModalInfo({ completeCnt: 0, allImagesCnt: imageFiles.imageFileList.length })
    window.api.send(ImagesIpcId.UPLOAD_IMAGES, JSON.stringify(imageFiles));
  };

  const onMousemove = (e: MouseEvent) => {
    setPreview((state: Preview): Preview => {
      let isDisplay = state.isDisplay;
      let isFlagBreak = state.isFlagBreak;
      let x = e.screenX;
      let y = e.screenY;

      if ( state.isDisplay ) {
        let dx = Math.abs(state.startingPos.x - e.screenX);
        let dy = Math.abs(state.startingPos.y - e.screenY);
        x = state.startingPos.x;
        y = state.startingPos.y;

        if ( dx > 16 || dy > 16 ) {
          // マウスを早く動かしたときscreenX,screenYが飛び飛びになって、
          // 表示範囲に入った瞬間に消えてしまうため、範囲内で一回以上MouseEventが置きないと非表示にしない
          if ( isFlagBreak ) {
            isDisplay = false;
          } else {
            x = e.screenX;
            y = e.screenY;
          }
        } else {
          isFlagBreak = true;
        }
      }

      return {isDisplay: isDisplay, isFlagBreak: isFlagBreak, startingPos: {x: x, y: y}}
    });
  };

  const onThumbnailAreaClick = (e:any) => {
    if ( e.target == e.currentTarget ) updateSelectImages([])
  };

  const onImageClick = (e:any, imageId: string) => {
    e.preventDefault();

    if ( e.metaKey || e.ctrlKey ) { // command or ctrl
      setSelectedImageId(state => [...state, imageId])
    } else if ( e.shiftKey ) {
      // 前回クリックした画像と今回の間の画像を選択状態にする
      var shiftRange = false;
      var selectImageIds: string[] = [];
      imageList.images.forEach((img) => {
        let isEdge = img.image_id == imageId || img.image_id == lastClickImageId;
        let prevShiftRange = shiftRange;
        if ( isEdge && !shiftRange ) shiftRange = true;
        if ( shiftRange ) selectImageIds.push(img.image_id);
        if ( isEdge && prevShiftRange && shiftRange ) shiftRange = false;
      });
      updateSelectImages(selectImageIds);
    } else {
      updateSelectImages([imageId]);
    }

    setLastClickImageId(imageId);
  };

  const updateSelectImages = (imageIds: string[]) => {
    setSelectedImageId(imageIds)
  }

  const onLeaveThumbneil = () => {
    setPreview({isDisplay: false, isFlagBreak: false, startingPos: {x: 0, y: 0}});
  };

  const thumbImgStyle = (width: number, height: number): React.CSSProperties => {
    const heightMax = 120;
    return { width: `${width * heightMax / height}px`, height: `${heightMax}px` }
  }

  const iconEnter = (e: any) => {
    setPreview((state: Preview): Preview => {
      return {isDisplay: true, isFlagBreak: false, startingPos: state.startingPos};
    });

    let imageId = e.target.dataset.image_id;
    let img: any = document.getElementById(`image-${imageId}`);
    if ( img ) {
      let imgPreview: any = document.getElementById("image-preview");
      imgPreview.src = img.src;
      imgPreview.style.width = `${e.target.dataset.width}px`;
      imgPreview.style.height = `${e.target.dataset.height}px`;
    }

    const requestImage: RequestImage = {
      workspaceId: props.workspaceId,
      imageId: imageId,
      isThumbnail: false,
    }
    window.api.send(ImagesIpcId.REQUEST_ORIG_IMAGE, JSON.stringify(requestImage));
  };

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

    return () => {
      if (ref.current === null) return;
      observer.unobserve(ref.current)
    }
  });

  let thumbnailArea: HTMLElement | null = document.getElementById('thumbnail-area');

  const previewStyle: React.CSSProperties = {
    position: 'absolute',
    maxWidth: thumbnailArea?.offsetWidth,
    maxHeight: thumbnailArea?.offsetHeight,
    visibility: preview.isDisplay ? 'visible': 'hidden',
    opacity: preview.isDisplay ? '1': '0',
    backgroundColor: 'rbga(0,0,0,0)',
    objectFit: 'contain',
    transitionProperty: 'opacity',
    transitionDuration: '0.15s',
    transitionDelay: '0.2s',
  };

  const reactModalStyle: ReactModal.Styles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: CssConst.MAIN_BACKGROUND_COLOR,
      borderColor: CssConst.EDGE_GRAY,
      color: CssConst.MAIN_FONT_COLOR,
    },
    overlay: {
      background: 'rgba(0, 0, 0, 0.5)'
    }
  };

  return (
    <div
      id="thumbnail-area"
      className={`thumbnail-area ${isDragOverState ? 'drag-over' : ''} ${props.hide ? 'hide' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={onThumbnailAreaClick}
      onMouseLeave={onLeaveThumbneil}
    >
      {
        imageList.images.map((image) => {
          return (
            <div className={`thumbnail ${selectedImageId.includes(image.image_id) ? 'selected' : ''}`}
              onClick={(e)=>{ onImageClick(e, image.image_id) }}
              onDoubleClick={()=>{ if ( props.onImageDoubleClick ) props.onImageDoubleClick(image.image_id); }}
            >
              <img id={`image-${image.image_id}`} style={thumbImgStyle(image.width, image.height)}></img>
              <div
                className="original-size-icon"
                onMouseEnter={iconEnter}
                data-image_id={image.image_id}
                data-width={image.width}
                data-height={image.height}>
                  <FontAwesomeIcon icon={faBars} />
              </div>
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

      <img id="image-preview" style={previewStyle}></img>

      <ReactModal
        isOpen={isShowImageUploadModal}
        onRequestClose={ () => { setIsShowImageUploadModal(false) } }
        style={reactModalStyle}
      >
        <form className="modal-form" onSubmit={ () => { setIsShowImageUploadModal(false) } }>
          <div className="title">アップロード中</div>
          <div className="show-block">
            <div>{uploadModalInfo.completeCnt}/{uploadModalInfo.allImagesCnt}</div>
          </div>
        </form>
      </ReactModal>
    </div>
  );
}
