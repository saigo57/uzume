import { IpcId as TagsIpcId, GetAllTags, TagList, TagInfo } from '../ipc/tags'
import { SetterOrUpdater } from 'recoil'

let prevWorkspaceId = ''

export const resetWorkspaceId = () => {
  prevWorkspaceId = ''
}

export const sendIpcGetAllTags = (workspaceId: string, setTagAllList: SetterOrUpdater<TagInfo[]>) => {
  if (prevWorkspaceId == workspaceId) return
  prevWorkspaceId = workspaceId

  const req = {
    workspaceId: workspaceId,
  } as GetAllTags

  window.api.invoke(TagsIpcId.Invoke.GET_ALL_TAGS, JSON.stringify(req)).then(arg => {
    const tagList = JSON.parse(arg) as TagList
    setTagAllList(tagList.tags)
  })
}
