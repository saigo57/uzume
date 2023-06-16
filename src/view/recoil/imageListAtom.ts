import { atom, selector, DefaultValue } from 'recoil'
import { ImageInfo } from '../../ipc/images'

export type ImageList = {
  page: number
  images: ImageInfo[]
}

export const imageListAtom = atom({
  key: 'imageList',
  default: { page: 0, images: [] } as ImageList,
})

export const imageInfoListAtom = selector({
  key: 'imageInfoList',
  get: ({ get }) => {
    const imageList = get(imageListAtom)
    return imageList.images
  },
  set: ({ get, set, reset }, imageInfoList) => {
    if (imageInfoList instanceof DefaultValue) {
      reset(imageListAtom)
      return
    }
    const prevState = get(imageListAtom)
    const nextImageList = { page: prevState.page, images: [...prevState.images] } // deep copy
    imageInfoList.forEach(img => {
      for (let i = 0; i < nextImageList.images.length; i++) {
        if (nextImageList.images[i].image_id == img.image_id) {
          nextImageList.images[i] = img
        }
      }
    })
    set(imageListAtom, nextImageList)
  },
})
