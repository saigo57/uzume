import React from 'react'
import { ImageData } from '../../ipc/images'

type ImageViewMultiProps = {
  images: ImageData[]
  selectedImageId: string | null
  isShowSidePanel: boolean
  onImageSelect: (imageId: string) => void
}

export const ImageViewMulti: React.VFC<ImageViewMultiProps> = props => {
  return (
    <div className={`images-area images-area-multi ${props.isShowSidePanel ? 'show-side-panel' : ''}`}>
      {props.images.map(imageData => {
        const selected = props.selectedImageId == imageData.imageId ? 'selected' : ''
        return (
          <img
            id={`image-orig-${imageData.imageId}`}
            className={selected}
            src={'data:image;base64,' + imageData.imageBase64}
            onDoubleClick={() => {
              props.onImageSelect(imageData.imageId)
            }}
          ></img>
        )
      })}
    </div>
  )
}
