import React, { useState, useEffect } from 'react'
import { useRecoilState, useSetRecoilState, useRecoilValue } from 'recoil'
import { IpcId as ImagesIpcId, ImageInfo, ImageInfos, ShowImages, RequestImage } from '../../ipc/images'
import { imageQueueAtom } from '../recoil/imageQueueAtom'
import { imageListAtom, ImageList } from '../recoil/imageListAtom'
import { searchTagIdsAtom, searchTypeAtom } from '../recoil/searchAtom'
import { reloadImagesEventAtom } from '../recoil/eventAtom'
import { useRecoilEvent } from './../lib/eventCustomHooks'

export const useCollectImage = (
  workspaceId: string,
  uncategorized: boolean,
  clearSelectedImage: () => void
): [ImageList, boolean, React.RefObject<HTMLDivElement>, () => void] => {
  const [imageList, setImageList] = useRecoilState(imageListAtom)
  const tagIds = useRecoilValue(searchTagIdsAtom)
  const searchType = useRecoilValue(searchTypeAtom)
  const [nextPageRequestableState, setNextPageRequestable] = useState(false)
  const setImageQueue = useSetRecoilState(imageQueueAtom)
  const [reloadImageEvent, _] = useRecoilEvent(reloadImagesEventAtom, null)

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

  const reloadImageInfo = () => {
    if (workspaceId.length > 0) {
      setImageList({ images: [], page: 0 })
      setNextPageRequestable(false)
      requestShowImages(1)
    }
  }

  useEffect(() => {
    // 条件が変わったら画像情報をリロードする
    reloadImageInfo()
  }, [workspaceId, uncategorized, tagIds.join('-'), searchType, reloadImageEvent])

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

  return [imageList, nextPageRequestableState, ref, reloadImageInfo]
}
