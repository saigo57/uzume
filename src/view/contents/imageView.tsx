import React, { useEffect } from 'react'
import { IpcId as ImagesIpcId, RequestImage, ImageData } from '../../ipc/images'

type ImageViewProps = {
  workspaceId: string
  imageId: string
}

export const ImageView: React.VFC<ImageViewProps> = props => {
  useEffect(() => {
    const requestImage: RequestImage = {
      workspaceId: props.workspaceId,
      imageId: props.imageId,
      isThumbnail: false,
    }
    window.api.send(ImagesIpcId.ToMainProc.REQUEST_ORIG_IMAGE, JSON.stringify(requestImage))
  }, [props.imageId])

  useEffect(() => {
    window.api.on(ImagesIpcId.ToRenderer.REQUEST_ORIG_IMAGE, (_e, arg) => {
      const imageData = JSON.parse(arg) as ImageData
      const img: any = document.getElementById(`image-orig-${imageData.imageId}`)
      if (img) {
        img.src = 'data:image;base64,' + imageData.imageBase64
      }
    })
  }, [])

  return (
    <div className="image-frame">
      <img id={`image-orig-${props.imageId}`}></img>
    </div>
  )
}
