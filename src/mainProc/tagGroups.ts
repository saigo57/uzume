import { ipcMain } from 'electron'
import { IpcId, GetAllTagGroups, CreateTagGroup, AddToTagGroup } from '../ipc/tagGroups'
import TagGroupUseCase from './useCase/tagGroupUseCase'
import { showFooterMessage } from '../ipc/footer'

ipcMain.handle(IpcId.Invoke.GET_ALL_TAG_GROUPS, async (e, arg) => {
  const reqAllTagGroups: GetAllTagGroups = JSON.parse(arg)

  try {
    const tagGroups = await TagGroupUseCase.fetchAllTagGroups(reqAllTagGroups.workspaceId)
    return JSON.stringify({ tag_groups: tagGroups })
  } catch (err) {
    showFooterMessage(e, `タググループリストの取得に失敗しました。[${err}]`)
  }
})

ipcMain.handle(IpcId.Invoke.CREATE_NEW_TAG_GROUP, async (e, arg) => {
  const reqCreateTagGroup: CreateTagGroup = JSON.parse(arg)
  try {
    await TagGroupUseCase.createTagGroup(reqCreateTagGroup.workspaceId, reqCreateTagGroup.name)
  } catch (err) {
    showFooterMessage(e, `タググループの新規作成に失敗しました。[${err}]`)
  }
})

ipcMain.handle(IpcId.Invoke.ADD_TO_TAG_GROUP, async (e, arg) => {
  const reqAddToTagGroup: AddToTagGroup = JSON.parse(arg)

  try {
    await TagGroupUseCase.addTagToTagGroup(
      reqAddToTagGroup.workspaceId,
      reqAddToTagGroup.tagGroupId,
      reqAddToTagGroup.tagId
    )
  } catch (err) {
    showFooterMessage(e, `タググループへのタグ追加に失敗しました。[${err}]`)
  }
})
