import { atom, selector } from 'recoil'

export const MenuMode = {
  HOME: 'home',
  TAG_MANAGE: 'tag_manage',
  UNCATEGORIZED: 'uncategorized',
} as const
export type MenuMode = typeof MenuMode[keyof typeof MenuMode]

export const menuModeAtom = atom({
  key: 'uncategorizedAtom',
  default: MenuMode.HOME as MenuMode,
})
export const isUncategorizedModeAtom = selector({
  key: 'isUncategorizedModeAtom',
  get: ({ get }) => {
    return get(menuModeAtom) == MenuMode.UNCATEGORIZED
  },
})
