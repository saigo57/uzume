import { atom, selector } from 'recoil'
import { TagInfo } from '../../ipc/tags'

export const searchTagsAtom = atom({
  key: 'searchTags',
  default: [] as TagInfo[],
})
export const searchTagIdsAtom = selector({
  key: 'searchTagIds',
  get: ({ get }) => {
    const searchTags = get(searchTagsAtom)
    return searchTags.map(t => t.tagId)
  },
})

export const searchTypeAtom = atom({
  key: 'searchType',
  default: 'and',
})
