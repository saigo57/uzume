import React, { useState, useEffect } from 'react'
import { IpcId as ImagesIpcId, ImageInfo, ImageInfos, ShowImages, RequestImage } from '../../ipc/images'

export type ImageList = {
  page: number
  images: ImageInfo[]
}

export const useCollectImage = (
  workspaceId: string,
  uncategorized: boolean,
  tagIds: string[],
  searchType: string,
  clearSelectedImage: () => void
): [ImageList, boolean, React.RefObject<HTMLDivElement>, (targetImageId: string, imageInfo: ImageInfo) => void] => {
  const [imageList, setImageList] = useState({ page: 0, images: [] } as ImageList)
  const [nextPageRequestableState, setNextPageRequestable] = useState(false)

  const requestShowImages = (page: number) => {
    if (workspaceId == '') return

    const showImages: ShowImages = {
      workspaceId: workspaceId,
      page: page,
      tagIds: tagIds,
      searchType: searchType,
      uncategorized: uncategorized,
    }
    window.api.send(ImagesIpcId.ToMainProc.SHOW_IMAGES, JSON.stringify(showImages))
  }

  // ワークスペースの切替時にリセットする
  useEffect(() => {
    if (workspaceId.length > 0) {
      setImageList({ images: [], page: 0 })
      setNextPageRequestable(false)
      requestShowImages(1)
    }
  }, [workspaceId, uncategorized])

  useEffect(() => {
    if (imageList.page > 0) setNextPageRequestable(true)
  }, [imageList.page])

  useEffect(() => {
    window.api.on(ImagesIpcId.ToRenderer.SHOW_IMAGES, (_e, arg) => {
      const rcvImageInfos = JSON.parse(arg) as ImageInfos
      clearSelectedImage()

      if (rcvImageInfos.images.length == 0) {
        if (rcvImageInfos.page == 1) setImageList({ page: 1, images: [] })
        setNextPageRequestable(false)
        return
      }

      setImageList(prevState => {
        const requestImage = (newImages: ImageInfo[]) => {
          newImages.forEach(image => {
            const reqImage: RequestImage = {
              workspaceId: rcvImageInfos.workspaceId,
              imageId: image.image_id,
              isThumbnail: true,
            }
            window.api.send(ImagesIpcId.ToMainProc.REQUEST_THUMB_IMAGE, JSON.stringify(reqImage))
          })
        }

        if (rcvImageInfos.page == 1) {
          // TODO:スクロール量もリセットする必要あり？
          requestImage(rcvImageInfos.images)
          return {
            images: rcvImageInfos.images,
            page: 1,
          }
        }

        // 新しく取得した画像のデータを取得する
        const addImages: ImageInfo[] = []
        const currImages: { [image_id: string]: boolean } = {}
        for (let i = 0; i < prevState.images.length; i++) {
          currImages[prevState.images[i].image_id] = true
        }
        for (let i = 0; i < rcvImageInfos.images.length; i++) {
          if (rcvImageInfos.images[i].image_id in currImages) continue
          addImages.push(rcvImageInfos.images[i])
        }

        requestImage(addImages)

        return {
          images: [...prevState.images, ...addImages],
          page: rcvImageInfos.page,
        }
      })
    })
  }, [])

  // 無限スクロール発火の監視
  const ref = React.useRef<HTMLDivElement>(null)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (nextPageRequestableState) {
            setNextPageRequestable(false)
            requestShowImages(imageList.page + 1)
          }
        }
      },
      { threshold: 0.5 }
    )
    if (ref.current === null) return
    observer.unobserve(ref.current)
    if (nextPageRequestableState) observer.observe(ref.current)

    return () => {
      if (ref.current === null) return
      observer.unobserve(ref.current)
    }
  })

  const replaceImageInfo = (targetImageId: string, imageInfo: ImageInfo) => {
    setImageList(prevState => {
      const nextImages = [...prevState.images]

      for (let i = 0; i < nextImages.length; i++) {
        if (nextImages[i].image_id == targetImageId) {
          // 差し替え
          nextImages[i] = imageInfo
        }
      }

      return {
        images: nextImages,
        page: prevState.page,
      }
    })
  }

  return [imageList, nextPageRequestableState, ref, replaceImageInfo]
}
