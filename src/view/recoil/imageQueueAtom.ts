import { atom } from 'recoil'
import { FetchImage } from '../../ipc/images'

export const imageQueueAtom = atom({
  key: 'imageQueue',
  default: [] as FetchImage[],
})

export const imageRequestingAtom = atom({
  key: 'imageRequsetiong',
  default: false,
})
