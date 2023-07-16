import { atom } from 'recoil'
import { Event } from '../lib/eventCustomHooks'

export const reloadImagesEventAtom = atom({
  key: 'showImagesEventAtom',
  default: { triggerNum: 0 } as Event,
})

export const singleTagClickEventAtom = atom({
  key: 'singleTagClickEventAtom',
  default: { triggerNum: 0 } as Event,
})
