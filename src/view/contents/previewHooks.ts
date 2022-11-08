import { useState, useEffect } from 'react'
import { IpcId as ImagesIpcId, RequestImage } from '../../ipc/images'

type Point = {
  x: number
  y: number
}

type PreviewStatus = {
  isDisplay: boolean
  isFlagBreak: boolean
  startingPos: Point
}

export const usePreview = (workspaceId: string): [PreviewStatus, () => void, (e: any) => void] => {
  const [previewStatus, setPreview] = useState({
    isDisplay: false,
    isFlagBreak: false,
    startingPos: { x: 0, y: 0 },
  } as PreviewStatus)

  const onMousemove = (e: MouseEvent) => {
    setPreview((state: PreviewStatus): PreviewStatus => {
      let isDisplay = state.isDisplay
      let isFlagBreak = state.isFlagBreak
      let x = e.screenX
      let y = e.screenY

      if (state.isDisplay) {
        const dx = Math.abs(state.startingPos.x - e.screenX)
        const dy = Math.abs(state.startingPos.y - e.screenY)
        x = state.startingPos.x
        y = state.startingPos.y

        if (dx > 16 || dy > 16) {
          // マウスを早く動かしたときscreenX,screenYが飛び飛びになって、
          // 表示範囲に入った瞬間に消えてしまうため、範囲内で一回以上MouseEventが置きないと非表示にしない
          if (isFlagBreak) {
            isDisplay = false
          } else {
            x = e.screenX
            y = e.screenY
          }
        } else {
          isFlagBreak = true
        }
      }

      return { isDisplay: isDisplay, isFlagBreak: isFlagBreak, startingPos: { x: x, y: y } }
    })
  }

  const onLeaveThumbneil = () => {
    setPreview({ isDisplay: false, isFlagBreak: false, startingPos: { x: 0, y: 0 } })
  }

  const iconEnter = (e: any) => {
    setPreview((state: PreviewStatus): PreviewStatus => {
      return { isDisplay: true, isFlagBreak: false, startingPos: state.startingPos }
    })

    const imageId = e.target.dataset.image_id
    const img: any = document.getElementById(`image-${imageId}`)
    if (img) {
      const imgPreview: any = document.getElementById('image-preview')
      imgPreview.src = img.src
      imgPreview.style.width = `${e.target.dataset.width}px`
      imgPreview.style.height = `${e.target.dataset.height}px`
    }

    const requestImage: RequestImage = {
      workspaceId: workspaceId,
      imageId: imageId,
      isThumbnail: false,
    }
    window.api.send(ImagesIpcId.ToMainProc.REQUEST_ORIG_IMAGE, JSON.stringify(requestImage))
  }

  useEffect(() => {
    const thumbnailArea: any = document.getElementById('thumbnail-area')
    thumbnailArea.addEventListener('mousemove', onMousemove)

    return () => {
      thumbnailArea.removeEventListener('mousemove', onMousemove)
    }
  })

  return [previewStatus, onLeaveThumbneil, iconEnter]
}
