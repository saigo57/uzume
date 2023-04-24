import React, { useState, useEffect } from 'react'
import { useRecoilState } from 'recoil'
import ReactModal from 'react-modal'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faLayerGroup } from '@fortawesome/free-solid-svg-icons'
import {
  IpcId as ImagesIpcId,
  ShowContextMenu,
  Reflect,
  ImageFiles,
  ImageInfo,
  ImageData,
  ImageUploadProgress,
  GroupThumbChanged,
  RequestImage,
} from '../../ipc/images'
import CssConst from './../cssConst'
import { Event } from './../lib/eventCustomHooks'
import { useCollectImage } from './collectImagesHooks'
import { usePreview } from './previewHooks'
import { CtrlLikeKey, dummyImageBase64 } from '../lib/helper'
import { imageQueueAtom, imageRequestingAtom } from '../recoil/imageQueueAtom'

type ImageIndexViewProps = {
  workspaceId: string
  onChangeSelectedImages: (imageIds: string[]) => void
  onImageDoubleClick: (imageId: string) => void
  clearSearchTags: () => void
  hide: boolean
  tagIds: string[]
  searchType: string
  uncategorized: boolean
  onShowImagesEvent: Event
}

type UploadModalInfo = {
  completeCnt: number
  allImagesCnt: number
}

type SelectedSingleImageId = {
  imageId: string | null
}

export const ImageIndexView: React.VFC<ImageIndexViewProps> = props => {
  const [selectedImageId, setSelectedImageId] = useState([] as string[])
  // api.onの中でselectedImageIdを使うと最初の参照しか見れないので、参照が変わらないstateに都度コピーする
  const [selectedSingleImageId, setSelectedSingleImageId] = useState({ imageId: null } as SelectedSingleImageId)
  const [imageList, nextPageRequestableState, infScrollRef, replaceImageInfo] = useCollectImage(
    props.workspaceId,
    props.uncategorized,
    props.tagIds,
    props.searchType,
    () => setSelectedImageId([])
  )
  const [previewStatus, onLeaveThumbneil, iconEnter] = usePreview(props.workspaceId)
  const [isDragOverState, setIsDragOver] = useState(false)
  const [lastClickImageId, setLastClickImageId] = useState('')
  const [isShowImageUploadModal, setIsShowImageUploadModal] = useState(false)
  const [uploadModalInfo, setUploadModalInfo] = useState({ completeCnt: 0, allImagesCnt: 0 } as UploadModalInfo)

  const [imageQueueClock, setImageQueueClock] = useState(false)
  const [imageQueue, setImageQueue] = useRecoilState(imageQueueAtom)
  const [imageRequesting, setImageRequesting] = useRecoilState(imageRequestingAtom)

  // TODO: どこで持つべきか(少なくともここではなさそう)
  const supportedExts = ['jpeg', 'jpg', 'png', 'gif']

  useEffect(() => {
    window.api.on(ImagesIpcId.ToRenderer.REPLY_REFLECT, (_e, arg) => {
      const reflect = JSON.parse(arg) as Reflect
      window.api.send(reflect.replyId)
    })
  }, [])

  useEffect(() => {
    const imgs: any = document.getElementsByClassName('thumbnail-img')
    if (!imgs) return

    for (let i = 0; i < imgs.length; i++) {
      imgs[i].src = dummyImageBase64
    }
  }, [props.onShowImagesEvent])

  useEffect(() => {
    if (props.onChangeSelectedImages) props.onChangeSelectedImages(selectedImageId)

    let imageId = null as string | null
    if (selectedImageId.length == 1) imageId = selectedImageId[0]
    setSelectedSingleImageId(state => {
      state.imageId = imageId
      return state
    })
  }, [selectedImageId])

  // imageQueueの動作clock
  useEffect(() => {
    const interval = setInterval(() => {
      setImageQueueClock(prev => !prev)
    }, 5)
    return () => clearInterval(interval)
  })

  useEffect(() => {
    if (imageRequesting || imageQueue.length == 0) return

    setImageRequesting(true)
    window.api
      .invoke(ImagesIpcId.Invoke.FETCH_IMAGE, JSON.stringify(imageQueue[0]))
      .then((data: string) => {
        const imageData: ImageData = JSON.parse(data)
        const img: any = document.getElementById(`image-${imageData.imageId}`)
        if (img) {
          img.src = 'data:image;base64,' + imageData.imageBase64
        }
      })
      .finally(() => {
        setImageRequesting(false)
      })
    setImageQueue(prevImages => prevImages.slice(1))
  }, [imageQueueClock])

  // 画像(情報)受信系
  useEffect(() => {
    window.api.on(ImagesIpcId.ToRenderer.UPDATE_IMAGE_INFO, (_e, arg) => {
      const imageInfoList = JSON.parse(arg) as ImageInfo[]
      imageInfoList.forEach(img => {
        for (let i = 0; i < imageList.images.length; i++) {
          if (imageList.images[i].image_id == img.image_id) {
            imageList.images[i] = img
          }
        }
      })
    })

    window.api.on(ImagesIpcId.ToRenderer.IMAGE_UPLOAD_PROGRESS, (_e, arg) => {
      const progress = JSON.parse(arg) as ImageUploadProgress
      if (progress.completeCnt < progress.allImagesCnt) {
        setUploadModalInfo({ completeCnt: progress.completeCnt, allImagesCnt: progress.allImagesCnt })
      } else {
        props.clearSearchTags()
        setIsShowImageUploadModal(false)
      }
    })
  }, [])

  useEffect(() => {
    window.api.on(ImagesIpcId.ToRenderer.GROUP_THUMB_CHANGED, (_e: any, arg: any) => {
      const groupThumbChanged = JSON.parse(arg) as GroupThumbChanged

      // もともとのthumb画像が同じであること
      if (selectedSingleImageId.imageId != groupThumbChanged.prevThumbImageId) return
      // thumb画像が変化していること
      if (groupThumbChanged.prevThumbImageId == groupThumbChanged.image.image_id) return

      // 旧thumbをダミー画像に置き換え
      const img: any = document.getElementById(`image-${groupThumbChanged.prevThumbImageId}`)
      if (img) {
        img.src = dummyImageBase64
      }
      // thumb画像の情報を差し替え
      replaceImageInfo(groupThumbChanged.prevThumbImageId, groupThumbChanged.image)
      setSelectedImageId([groupThumbChanged.image.image_id])
      // thumb画像を要求
      const reqImage: RequestImage = {
        workspaceId: groupThumbChanged.workspaceId,
        imageId: groupThumbChanged.image.image_id,
        isThumbnail: true,
      }
      window.api.send(ImagesIpcId.ToMainProc.REQUEST_THUMB_IMAGE, JSON.stringify(reqImage))
    })
  }, [])

  const showContextMenu = (e: any) => {
    e.preventDefault()
    const msg = JSON.stringify({
      workspaceId: props.workspaceId,
      imageIds: selectedImageId,
    } as ShowContextMenu)
    window.api.send(ImagesIpcId.ToMainProc.SHOW_CONTEXT_MENU, msg)
  }

  useEffect(() => {
    Array.from(document.getElementsByClassName('thumbnail')).forEach(target => {
      target.addEventListener('contextmenu', showContextMenu)
    })

    return () => {
      Array.from(document.getElementsByClassName('thumbnail')).forEach(target => {
        target.removeEventListener('contextmenu', showContextMenu)
      })
    }
  })

  /* シンプルなイベントハンドラ */

  const handleDragOver = (e: any) => {
    e.stopPropagation()
    e.preventDefault()

    setIsDragOver(true)
  }

  const handleDragLeave = (e: any) => {
    e.stopPropagation()
    e.preventDefault()

    setIsDragOver(false)
  }

  const handleDrop = (e: any) => {
    e.stopPropagation()
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files.length == 0) return

    const imageFiles: ImageFiles = {
      workspaceId: props.workspaceId,
      imageFileList: [],
      tagIds: props.tagIds,
      searchType: props.searchType,
    }
    for (let i = 0; i < e.dataTransfer.files.length; i++) {
      const filePath = e.dataTransfer.files[i].path
      const ext = filePath.split('.').pop()
      if (!supportedExts.includes(ext.toLowerCase())) {
        window.showConfirmModal(`未対応のファイル形式です。\n一括登録の場合すべてキャンセルされます。\n${filePath}`)
        return
      }

      imageFiles.imageFileList.push(filePath)
    }

    setIsShowImageUploadModal(true)
    setUploadModalInfo({ completeCnt: 0, allImagesCnt: imageFiles.imageFileList.length })
    window.api.send(ImagesIpcId.ToMainProc.UPLOAD_IMAGES, JSON.stringify(imageFiles))
  }

  const onThumbnailAreaClick = (e: any) => {
    if (e.target == e.currentTarget) updateSelectImages([])
  }

  const updateSelectImages = (imageIds: string[]) => {
    setSelectedImageId(imageIds)
  }
  const onImageClick = (e: any, imageId: string) => {
    e.preventDefault()

    if (CtrlLikeKey(e)) {
      // command or ctrl
      setSelectedImageId(state => [...state, imageId])
    } else if (e.shiftKey) {
      // 前回クリックした画像と今回の間の画像を選択状態にする
      let shiftRange = false
      const selectImageIds: string[] = []
      imageList.images.forEach(img => {
        const isEdge = img.image_id == imageId || img.image_id == lastClickImageId
        const prevShiftRange = shiftRange
        if (isEdge && !shiftRange) shiftRange = true
        if (shiftRange) selectImageIds.push(img.image_id)
        if (isEdge && prevShiftRange && shiftRange) shiftRange = false
      })
      updateSelectImages(selectImageIds)
    } else {
      updateSelectImages([imageId])
    }

    setLastClickImageId(imageId)
  }

  /* デザイン */

  const thumbImgStyle = (width: number, height: number): React.CSSProperties => {
    const heightMax = 120
    return { width: `${(width * heightMax) / height}px`, height: `${heightMax}px` }
  }

  const thumbnailArea: HTMLElement | null = document.getElementById('thumbnail-area')

  const previewStyle: React.CSSProperties = {
    position: 'absolute',
    maxWidth: thumbnailArea?.offsetWidth,
    maxHeight: thumbnailArea?.offsetHeight,
    visibility: previewStatus.isDisplay ? 'visible' : 'hidden',
    opacity: previewStatus.isDisplay ? '1' : '0',
    backgroundColor: 'rbga(0,0,0,0)',
    objectFit: 'contain',
    transitionProperty: 'opacity',
    transitionDuration: '0.15s',
    transitionDelay: '0.2s',
  }

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
      background: 'rgba(0, 0, 0, 0.5)',
    },
  }

  const lastMarker: React.CSSProperties = {
    width: '100%',
    paddingTop: '1em',
    textAlign: 'center',
    fontSize: '0.9em',
    color: '#454545',
    userSelect: 'none',
  }

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
      {imageList.images.map(image => {
        return (
          <div
            id={`thumbnail-${image.image_id}`}
            className={`thumbnail ${selectedImageId.includes(image.image_id) ? 'selected' : ''}`}
            onClick={e => {
              onImageClick(e, image.image_id)
            }}
            onDoubleClick={() => {
              if (props.onImageDoubleClick) props.onImageDoubleClick(image.image_id)
            }}
          >
            <img
              id={`image-${image.image_id}`}
              className="thumbnail-img"
              style={thumbImgStyle(image.width, image.height)}
            ></img>
            <div
              className="original-size-icon"
              onMouseEnter={iconEnter}
              data-image_id={image.image_id}
              data-width={image.width}
              data-height={image.height}
            >
              <FontAwesomeIcon icon={faBars} />
            </div>

            {(() => {
              if (image.is_group_thumb_nail) {
                return (
                  <div className="grouped-image-icon">
                    <FontAwesomeIcon icon={faLayerGroup} />
                  </div>
                )
              }
            })()}
          </div>
        )
      })}
      {(() => {
        if (nextPageRequestableState) {
          return <div id="infinite-scroll-end-marker" ref={infScrollRef}></div>
        } else {
          return
        }
      })()}

      {(() => {
        if (imageList.page > 0 && !nextPageRequestableState) {
          return <div style={lastMarker}>- last -</div>
        } else {
          return <div style={lastMarker}>loading...</div>
        }
      })()}

      <img id="image-preview" style={previewStyle}></img>

      <ReactModal
        isOpen={isShowImageUploadModal}
        onRequestClose={() => {
          setIsShowImageUploadModal(false)
        }}
        style={reactModalStyle}
      >
        <form
          className="modal-form"
          onSubmit={() => {
            setIsShowImageUploadModal(false)
          }}
        >
          <div className="title">アップロード中</div>
          <div className="show-block">
            <div>
              {uploadModalInfo.completeCnt}/{uploadModalInfo.allImagesCnt}
            </div>
          </div>
        </form>
      </ReactModal>
    </div>
  )
}
