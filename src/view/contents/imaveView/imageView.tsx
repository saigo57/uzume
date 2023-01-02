import React, { useEffect, useState } from 'react'
import { DragDropContext, DropResult, Droppable, Draggable } from 'react-beautiful-dnd'
import { IpcId as ImagesIpcId, RequestImage, ImageData, SortGroupImages } from '../../../ipc/images'
import { ImageViewMulti } from './imageViewMulti'
import { ImageViewSingle } from './imageViewSingle'
import { Event } from '../../lib/eventCustomHooks'

type ImageViewProps = {
  workspaceId: string
  imageId: string
  onNextImageEvent: Event
  onPrevImageEvent: Event
}

export const ImageView: React.VFC<ImageViewProps> = props => {
  const [origImages, setOrigImages] = useState([] as ImageData[])
  const [selectedImageId, setSelectedImageId] = useState(null as string | null)

  useEffect(() => {
    const requestImage: RequestImage = {
      workspaceId: props.workspaceId,
      imageId: props.imageId,
      isThumbnail: false,
    }
    window.api.send(ImagesIpcId.ToMainProc.REQUEST_ORIG_IMAGES, JSON.stringify(requestImage))
  }, [props.imageId])

  useEffect(() => {
    window.api.on(ImagesIpcId.ToRenderer.REQUEST_ORIG_IMAGES, (_e, arg) => {
      const imageDatas = JSON.parse(arg) as ImageData[]

      setOrigImages(imageDatas)
    })
  }, [])

  useEffect(() => {
    if (origImages.length < 2) return

    const imageIds: string[] = []
    for (let i = 0; i < origImages.length; i++) {
      imageIds.push(origImages[i].imageId)
    }
    const sortGroupImages: SortGroupImages = {
      workspaceId: props.workspaceId,
      imageIds: imageIds,
    }

    window.api.send(ImagesIpcId.ToMainProc.SORT_GROUP_IMAGES, JSON.stringify(sortGroupImages))
  }, [origImages])

  const setNextImageId = () => {
    setSelectedImageId(currId => {
      if (!currId) return null

      let cnt = 0
      for (; cnt < origImages.length; cnt++) {
        if (origImages[cnt].imageId == currId) break
      }

      if (cnt + 1 < origImages.length) {
        return origImages[cnt + 1].imageId
      }

      return currId
    })
  }

  const setPrevImageId = () => {
    setSelectedImageId(currId => {
      if (!currId) return null

      let prevImageId = currId
      for (let i = 0; i < origImages.length; i++) {
        if (origImages[i].imageId == currId) break
        prevImageId = origImages[i].imageId
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

    for (let i = 0; i < origImages.length; i++) {
      if (origImages[i].imageId == imageId) {
        return origImages[i]
      }
    }

    return null
  }

  // ドラッグ&ドロップした要素を入れ替える
  const reorder = (list: ImageData[], startIndex: number, endIndex: number): ImageData[] => {
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
      origImages, // 順序を入れ変えたい配列
      result.source.index, // 元の配列の位置
      result.destination.index // 移動先の配列の位置
    )
    setOrigImages(movedItems)
  }

  const isShowSidePanel = origImages.length > 1

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
                    {origImages.map((imageData, index) => {
                      return (
                        <Draggable key={imageData.imageId} draggableId={imageData.imageId} index={index}>
                          {provided => (
                            <img
                              className={imageData.imageId == selectedImageId ? 'selected' : ''}
                              key={imageData.imageId}
                              src={'data:image;base64,' + imageData.imageBase64}
                              onClick={() => {
                                if (!selectedImageId) return

                                setSelectedImageId(imageData.imageId)
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
        const imageData = origImages.length == 1 ? origImages[0] : findImageById(selectedImageId)
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
            images={origImages}
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
