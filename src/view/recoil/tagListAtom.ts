import { atom } from 'recoil'
import { TagInfo } from '../../ipc/tags'

export const tagListAtom = atom({
  key: 'tagList',
  default: [] as TagInfo[],
})
