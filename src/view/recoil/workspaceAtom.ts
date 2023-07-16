import { atom, selector } from 'recoil'
import { CurrentWorkspace } from '../../ipc/currentWorkspace'

export const workspaceAtom = atom({
  key: 'workspaceAtom',
  default: {
    workspace_name: '',
    workspace_id: '',
  } as CurrentWorkspace,
})

export const workspaceIdAtom = selector({
  key: 'workspaceIdAtom',
  get: ({ get }) => {
    return get(workspaceAtom).workspace_id
  },
})
