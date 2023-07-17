import React, { useState, useEffect, useRef } from 'react'
import { ImageData } from '../../../ipc/images'
import { CtrlLikeKey } from '../../lib/helper'

type ImageViewSingleProps = {
  image: ImageData
  isShowSidePanel: boolean
  onContextMenu: () => void
}

type Point = {
  x: number
  y: number
}

export const ImageViewSingle: React.FC<ImageViewSingleProps> = props => {
  const [isHoming, setIsHoming] = useState(false)
  const [dragStartPagePoint, setDragStartPagePoint] = useState(null as null | Point)
  const [dragStartScrollPoint, setDragStartScrollPoint] = useState(null as null | Point)
  const [scale, setScale] = useState(1.0 as number)
  const MAX_SCALE = 10 as number
  const MIN_SCALE = 0.1 as number

  const resizeImage = (e: any) => {
    if (!CtrlLikeKey(e)) return

    e.preventDefault()
    e.stopPropagation()

    setScale((prevScale: number): number => {
      // 手前にホイールを動かしたとき画像を小さくする
      // 手前に動かしたとき 0 < e.deltaY になる
      const sensitivity = 4000
      const deltaDigits = e.deltaY / sensitivity
      const updateScale = 10 ** -deltaDigits
      const nextScale = prevScale * updateScale
      return Math.min(Math.max(nextScale, MIN_SCALE), MAX_SCALE)
    })
  }

  const imageRef = useRef<HTMLDivElement>(null)

  const homingImageToMouse = (e: any) => {
    if (!isHoming) return
    if (!dragStartPagePoint) return
    if (!dragStartScrollPoint) return
    if (!imageRef.current) return

    const dx = dragStartPagePoint.x - e.pageX
    const dy = dragStartPagePoint.y - e.pageY

    // 上下限は画面側でよしなにしてくれていそう
    imageRef.current.scrollLeft = dragStartScrollPoint.x + dx
    imageRef.current.scrollTop = dragStartScrollPoint.y + dy
  }

  const resetHomingImageStatuses = () => {
    setIsHoming(false)
    setDragStartPagePoint(null)
    setDragStartScrollPoint(null)
  }

  useEffect(() => {
    imageRef.current?.addEventListener('wheel', resizeImage)
    imageRef.current?.addEventListener('mousemove', homingImageToMouse)
    return () => {
      imageRef.current?.removeEventListener('wheel', resizeImage)
      imageRef.current?.removeEventListener('mousemove', homingImageToMouse)
    }
  })

  return (
    <div
      ref={imageRef}
      className={`images-area images-area-single  ${props.isShowSidePanel ? 'show-side-panel' : ''} ${
        isHoming ? 'homing' : ''
      }`}
    >
      <img
        id={`image-orig-${props.image.imageId}`}
        src={'data:image;base64,' + props.image.imageBase64}
        onContextMenu={() => {
          props.onContextMenu()
        }}
        onMouseDown={e => {
          const scrollLeft = imageRef.current?.scrollLeft
          const scrollTop = imageRef.current?.scrollTop
          if (scrollLeft == null || scrollTop == null) return

          setIsHoming(true)
          setDragStartPagePoint({ x: e.pageX, y: e.pageY })
          setDragStartScrollPoint({ x: scrollLeft, y: scrollTop })
        }}
        onMouseUp={resetHomingImageStatuses}
        onMouseLeave={resetHomingImageStatuses}
        width={`${100 * scale}%`}
      ></img>
    </div>
  )
}
