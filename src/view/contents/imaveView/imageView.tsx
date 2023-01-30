import React, { useEffect, useState } from 'react'
import { DragDropContext, DropResult, Droppable, Draggable } from 'react-beautiful-dnd'
import { IpcId as ImagesIpcId, RequestImage, ImageData, ImageInfo, SortGroupImages } from '../../../ipc/images'
import { ImageViewMulti } from './imageViewMulti'
import { ImageViewSingle } from './imageViewSingle'
import { Event } from '../../lib/eventCustomHooks'
import { dummyImageBase64 } from '../../lib/helper'
import { ImageBulk } from './imageTypes'

type ImageViewProps = {
  workspaceId: string
  imageId: string
  onNextImageEvent: Event
  onPrevImageEvent: Event
}

export const ImageView: React.VFC<ImageViewProps> = props => {
  const [imageInfoList, setImageInfoList] = useState([] as ImageInfo[])
  const [imageDataList, setImageDataList] = useState([] as ImageData[])
  const [imageThumbDataList, setImageThumbDataList] = useState([] as ImageData[])
  const [imageBulkList, setImageBulkList] = useState([] as ImageBulk[])
  const [imageThumbBulkList, setImageThumbBulkList] = useState([] as ImageBulk[])
  const [selectedImageId, setSelectedImageId] = useState(null as string | null)

  useEffect(() => {
    const requestImage: RequestImage = {
      workspaceId: props.workspaceId,
      imageId: props.imageId,
      isThumbnail: false,
    }
    window.api.send(ImagesIpcId.ToMainProc.REQUEST_GROUP_IMAGE_INFO_LIST, JSON.stringify(requestImage))
  }, [props.imageId])

  useEffect(() => {
    window.api.on(ImagesIpcId.ToRenderer.REQUEST_GROUP_IMAGE_INFO_LIST, (_e, arg) => {
      const imageInfoList = JSON.parse(arg) as ImageInfo[]
      setImageInfoList(imageInfoList)
    })
  }, [])

  useEffect(() => {
    if (imageInfoList.length == 0) return

    for (let i = 0; i < imageInfoList.length; i++) {
      const requestImage: RequestImage = {
        workspaceId: props.workspaceId,
        imageId: imageInfoList[i].image_id,
        isThumbnail: true,
      }

      window.api.send(ImagesIpcId.ToMainProc.REQUEST_SIMPLE_THUMB_IMAGE, JSON.stringify(requestImage))
    }

    for (let i = 0; i < imageInfoList.length; i++) {
      const requestImage: RequestImage = {
        workspaceId: props.workspaceId,
        imageId: imageInfoList[i].image_id,
        isThumbnail: false,
      }

      window.api.send(ImagesIpcId.ToMainProc.REQUEST_ORIG_IMAGE, JSON.stringify(requestImage))
    }
  }, [props.imageId, imageInfoList])

  useEffect(() => {
    setImageBulkList(_prev => {
      const imageDataListHash: { [key: string]: ImageData } = {}
      for (let i = 0; i < imageDataList.length; i++) {
        imageDataListHash[imageDataList[i].imageId] = imageDataList[i]
      }
      return imageInfoList.map(info => {
        if (info.image_id in imageDataListHash) {
          return { imageInfo: info, imageData: imageDataListHash[info.image_id] } as ImageBulk
        }

        return { imageInfo: info, imageData: null } as ImageBulk
      })
    })
  }, [imageDataList])

  useEffect(() => {
    setImageThumbBulkList(_prev => {
      const imageThumbDataListHash: { [key: string]: ImageData } = {}
      for (let i = 0; i < imageThumbDataList.length; i++) {
        imageThumbDataListHash[imageThumbDataList[i].imageId] = imageThumbDataList[i]
      }
      return imageInfoList.map(info => {
        if (info.image_id in imageThumbDataListHash) {
          return { imageInfo: info, imageData: imageThumbDataListHash[info.image_id] } as ImageBulk
        }

        return { imageInfo: info, imageData: null } as ImageBulk
      })
    })
  }, [imageThumbDataList])

  useEffect(() => {
    window.api.on(ImagesIpcId.ToRenderer.REQUEST_ORIG_IMAGE, (_e: any, arg: any) => {
      const imageData = JSON.parse(arg) as ImageData
      setImageDataList(prev => [...prev, imageData])
    })
  }, [])

  useEffect(() => {
    window.api.on(ImagesIpcId.ToRenderer.REQUEST_SIMPLE_THUMB_IMAGE, (_e: any, arg: any) => {
      const imageData = JSON.parse(arg) as ImageData
      setImageThumbDataList(prev => [...prev, imageData])
    })
  }, [])

  useEffect(() => {
    if (imageInfoList.length < 2) return

    const imageIds: string[] = []
    for (let i = 0; i < imageInfoList.length; i++) {
      imageIds.push(imageInfoList[i].image_id)
    }
    const sortGroupImages: SortGroupImages = {
      workspaceId: props.workspaceId,
      imageIds: imageIds,
    }

    window.api.send(ImagesIpcId.ToMainProc.SORT_GROUP_IMAGES, JSON.stringify(sortGroupImages))
  }, [imageInfoList])

  const setNextImageId = () => {
    setSelectedImageId(currId => {
      if (!currId) return null

      let cnt = 0
      for (; cnt < imageInfoList.length; cnt++) {
        if (imageInfoList[cnt].image_id == currId) break
      }

      if (cnt + 1 < imageInfoList.length) {
        return imageInfoList[cnt + 1].image_id
      }

      return currId
    })
  }

  const setPrevImageId = () => {
    setSelectedImageId(currId => {
      if (!currId) return null

      let prevImageId = currId
      for (let i = 0; i < imageInfoList.length; i++) {
        if (imageInfoList[i].image_id == currId) break
        prevImageId = imageInfoList[i].image_id
      }

      return prevImageId
    })
  }

  useEffect(() => {
    setNextImageId()
  }, [props.onNextImageEvent])

  useEffect(() => {
    setPrevImageId()
  }, [props.onPrevImageEvent])

  const onKeyDown = (e: any) => {
    if (e.code == 'ArrowUp' || e.code == 'ArrowLeft') {
      setPrevImageId()
    }

    if (e.code == 'ArrowDown' || e.code == 'ArrowRight') {
      setNextImageId()
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
    }
  })

  const findImageById = (imageId: string | null): ImageData | null => {
    if (imageId == null) return null

    for (let i = 0; i < imageBulkList.length; i++) {
      if (imageBulkList[i].imageInfo.image_id == imageId) {
        return imageBulkList[i].imageData
      }
    }

    return null
  }

  // ドラッグ&ドロップした要素を入れ替える
  const reorder = (list: ImageInfo[], startIndex: number, endIndex: number): ImageInfo[] => {
    const result = Array.from(list)
    const [removed] = result.splice(startIndex, 1)
    result.splice(endIndex, 0, removed)

    return result
  }

  const onDragEnd = (result: DropResult) => {
    // ドロップ先がない
    if (!result.destination) {
      return
    }
    // 配列の順序を入れ替える
    const movedItems = reorder(
      imageInfoList, // 順序を入れ変えたい配列
      result.source.index, // 元の配列の位置
      result.destination.index // 移動先の配列の位置
    )
    setImageInfoList(movedItems)
  }

  const isShowSidePanel = imageInfoList.length > 1

  return (
    <div className="image-view-area">
      {(() => {
        if (!isShowSidePanel) return

        return (
          <div className="images-side-panel">
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="images">
                {provided => (
                  <div className="images" {...provided.droppableProps} ref={provided.innerRef}>
                    {imageThumbBulkList.map((imageBulk, index) => {
                      let imageBase64 = dummyImageBase64
                      if (imageBulk.imageData) {
                        imageBase64 = 'data:image;base64,' + imageBulk.imageData.imageBase64
                      }

                      return (
                        <Draggable
                          key={imageBulk.imageInfo.image_id}
                          draggableId={imageBulk.imageInfo.image_id}
                          index={index}
                        >
                          {provided => (
                            <img
                              className={imageBulk.imageInfo.image_id == selectedImageId ? 'selected' : ''}
                              key={imageBulk.imageInfo.image_id}
                              src={imageBase64}
                              onClick={() => {
                                if (!selectedImageId) return

                                setSelectedImageId(imageBulk.imageInfo.image_id)
                              }}
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps} // TODO: styleが直で書かれる影響？でCSPが出ている
                            ></img>
                          )}
                        </Draggable>
                      )
                      {
                        provided.placeholder
                      }
                    })}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        )
      })()}

      {(() => {
        // 選択したときか1枚だけのときはsingleで表示
        const imageData = imageBulkList.length == 1 ? imageBulkList[0].imageData : findImageById(selectedImageId)
        if (imageData) {
          return (
            <ImageViewSingle
              image={imageData}
              isShowSidePanel={isShowSidePanel}
              onContextMenu={() => {
                setSelectedImageId(null)
              }}
            />
          )
        }

        return (
          <ImageViewMulti
            images={imageBulkList}
            selectedImageId={selectedImageId}
            isShowSidePanel={isShowSidePanel}
            onImageSelect={(imageId: string) => {
              setSelectedImageId(imageId)
            }}
          />
        )
      })()}
    </div>
  )
}
