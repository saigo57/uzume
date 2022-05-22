import { IpcId as TagsIpcId, GetAllTags } from '../ipc/tags'

let prevWorkspaceId = ''

export const resetWorkspaceId = () => {
  prevWorkspaceId = ''
}

export const sendIpcGetAllTags = (workspaceId: string) => {
  if (prevWorkspaceId == workspaceId) return
  prevWorkspaceId = workspaceId

  const req = {
    workspaceId: workspaceId,
  } as GetAllTags

  window.api.send(TagsIpcId.ToMainProc.GET_ALL_TAGS, JSON.stringify(req))
}
