import React from 'react'
import { ImageBulk } from './imageTypes'
import { dummyImageBase64 } from '../../lib/helper'

type ImageViewMultiProps = {
  images: ImageBulk[]
  selectedImageId: string | null
  isShowSidePanel: boolean
  onImageSelect: (imageId: string) => void
}

export const ImageViewMulti: React.FC<ImageViewMultiProps> = props => {
  return (
    <div className={`images-area images-area-multi ${props.isShowSidePanel ? 'show-side-panel' : ''}`}>
      {props.images.map(imageBulk => {
        if (!imageBulk.imageData) {
          const style = {
            width: `${imageBulk.imageInfo.width}px`,
            height: `${imageBulk.imageInfo.height}px`,
          } as React.CSSProperties

          return <img src={dummyImageBase64} style={style}></img>
        }

        const selected = props.selectedImageId == imageBulk.imageData.imageId ? 'selected' : ''
        return (
          <img
            id={`image-orig-${imageBulk.imageData.imageId}`}
            className={selected}
            src={'data:image;base64,' + imageBulk.imageData.imageBase64}
            onDoubleClick={() => {
              if (!imageBulk.imageData) return

              props.onImageSelect(imageBulk.imageData.imageId)
            }}
          ></img>
        )
      })}
    </div>
  )
}
