import React, { useEffect, useState } from 'react'
import { DragDropContext, DropResult, Droppable, Draggable } from 'react-beautiful-dnd'
import { IpcId as ImagesIpcId, RequestImage, ImageData, SortGroupImages } from '../../ipc/images'
import { ImageViewMulti } from './imageViewMulti'
import { ImageViewSingle } from './imageViewSingle'

type ImageViewProps = {
  workspaceId: string
  imageId: string
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

  const isShowSidePanel = origImages.length > 1 && selectedImageId == null

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
                              key={imageData.imageId}
                              src={'data:image;base64,' + imageData.imageBase64}
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
