import { useEffect, useState } from 'react'

class DraggalbeSplitBarData {
  startPageX = 0.0
  startRightWidth = 0.0
  startLeftWidth = 0.0
}

export const useDraggableSplitBar = (
  left: React.RefObject<HTMLDivElement>,
  split_bar: React.RefObject<HTMLDivElement>,
  right: React.RefObject<HTMLDivElement>
): void => {
  const [splitBarMemo, setSplitBarMemo] = useState(null as null | DraggalbeSplitBarData)

  useEffect(() => {
    window.addEventListener('mouseup', onMouseUp)

    return () => {
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [splitBarMemo])

  const onMouseDown = (e: MouseEvent) => {
    setSplitBarMemo({
      startPageX: e.pageX,
      startRightWidth: right.current ? right.current.offsetWidth : 0,
      startLeftWidth: left.current ? left.current.offsetWidth : 0,
    })
  }

  const onMouseUp = (_e: MouseEvent) => {
    setSplitBarMemo(null)
  }

  const onMouseMove = (e: MouseEvent) => {
    if (!left.current || !right.current || !split_bar.current || !splitBarMemo) return

    // dxを左側に足す
    let pageX = e.pageX
    // 画面外チェック
    if (pageX < 0) pageX = 0

    let dx = pageX - splitBarMemo.startPageX

    if (dx > 0) {
      // 右への移動
      const sideBarMinWidth = 100
      if (splitBarMemo.startRightWidth - dx < sideBarMinWidth) {
        dx = splitBarMemo.startRightWidth - sideBarMinWidth
      }
    } else {
      // 左への移動
      dx = -dx
      const mainMinWidth = 180
      if (splitBarMemo.startLeftWidth - dx < mainMinWidth) {
        dx = splitBarMemo.startLeftWidth - mainMinWidth
      }
      dx = -dx
    }

    right.current.style.width = splitBarMemo.startRightWidth - dx + 'px'
    left.current.style.width = splitBarMemo.startLeftWidth + dx + 'px'
    return false
  }

  if (split_bar.current) split_bar.current.onmousedown = onMouseDown
}
