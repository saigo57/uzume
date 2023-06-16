import React, { useState, useEffect } from 'react'
import { useRecoilState, useSetRecoilState } from 'recoil'
import { IpcId as ImagesIpcId, ImageInfo, ImageInfos, ShowImages, RequestImage } from '../../ipc/images'
import { imageQueueAtom } from '../recoil/imageQueueAtom'
import { imageListAtom, ImageList } from '../recoil/imageListAtom'

export const useCollectImage = (
  workspaceId: string,
  uncategorized: boolean,
  tagIds: string[],
  searchType: string,
  clearSelectedImage: () => void
): [
  ImageList,
  boolean,
  React.RefObject<HTMLDivElement>,
  (targetImageId: string, imageInfo: ImageInfo) => void,
  () => void
] => {
  const [imageList, setImageList] = useRecoilState(imageListAtom)
  const [nextPageRequestableState, setNextPageRequestable] = useState(false)
  const setImageQueue = useSetRecoilState(imageQueueAtom)

  const requestShowImages = (page: number) => {
    if (workspaceId == '') return

    const showImages: ShowImages = {
      workspaceId: workspaceId,
      page: page,
      tagIds: tagIds,
      searchType: searchType,
      uncategorized: uncategorized,
    }

    window.api.invoke(ImagesIpcId.Invoke.FETCH_IMAGE_LIST, JSON.stringify(showImages)).then(arg => {
      const rcvImageInfos = JSON.parse(arg) as ImageInfos
      clearSelectedImage()

      if (rcvImageInfos.images.length == 0) {
        if (rcvImageInfos.page == 1) setImageList({ page: 1, images: [] })
        setNextPageRequestable(false)
        return
      }

      const requestImage = (newImages: ImageInfo[]) => {
        const newImageRequests = newImages.map(image => {
          const reqImage: RequestImage = {
            workspaceId: rcvImageInfos.workspaceId,
            imageId: image.image_id,
            isThumbnail: true,
          }
          return reqImage
        })
        setImageQueue(prevState => {
          return prevState.concat(newImageRequests)
        })
      }

      if (rcvImageInfos.page == 1) {
        // TODO:スクロール量もリセットする必要あり？
        requestImage(rcvImageInfos.images)
        setImageList({
          images: rcvImageInfos.images,
          page: 1,
        })
        return
      }

      // 新しく取得した画像のデータを取得する
      const addImages: ImageInfo[] = []
      const currImages: { [image_id: string]: boolean } = {}
      for (let i = 0; i < imageList.images.length; i++) {
        currImages[imageList.images[i].image_id] = true
      }
      for (let i = 0; i < rcvImageInfos.images.length; i++) {
        if (rcvImageInfos.images[i].image_id in currImages) continue
        addImages.push(rcvImageInfos.images[i])
      }

      requestImage(addImages)

      setImageList(prevState => {
        return {
          images: [...prevState.images, ...addImages],
          page: rcvImageInfos.page,
        }
      })
    })
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

  const reloadImageInfo = () => {
    requestShowImages(1)
  }

  return [imageList, nextPageRequestableState, ref, replaceImageInfo, reloadImageInfo]
}
