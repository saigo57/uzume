import { atom } from 'recoil'
import { TagGroupInfo } from '../../ipc/tagGroups'

export const tagGroupListAtom = atom({
  key: 'tagGroupList',
  default: [] as TagGroupInfo[],
})
