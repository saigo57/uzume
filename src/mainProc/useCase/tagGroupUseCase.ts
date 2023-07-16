import { TagGroupInfo } from '../../ipc/tagGroups'
import BackendConnectorWorkspace from './backendConnectorWorkspace'

export default class TagGroupUseCase {
  public static async fetchAllTagGroups(workspaceId: string): Promise<TagGroupInfo[]> {
    const ws = await BackendConnectorWorkspace(workspaceId)
    const resTagList = await ws.tag_groups.getList()

    const tag_groups: TagGroupInfo[] = []
    if (resTagList.tag_groups !== null) {
      for (let i = 0; i < resTagList.tag_groups.length; i++) {
        tag_groups.push({
          tagGroupId: resTagList.tag_groups[i].tag_group_id,
          name: resTagList.tag_groups[i].name,
        })
      }
    }

    return tag_groups
  }

  public static async renameTagGroup(workspaceId: string, tagGroupId: string, tagGroupName: string): Promise<void> {
    const ws = await BackendConnectorWorkspace(workspaceId)
    await ws.tag_groups.RenameTagGroup(tagGroupId, tagGroupName)
  }

  public static async deleteTagGroup(workspaceId: string, tagGroupId: string): Promise<void> {
    const ws = await BackendConnectorWorkspace(workspaceId)
    await ws.tag_groups.DeleteTagGroup(tagGroupId)
  }

  public static async createTagGroup(workspaceId: string, tagGroupName: string): Promise<void> {
    const ws = await BackendConnectorWorkspace(workspaceId)
    await ws.tag_groups.createNewTagGroup(tagGroupName)
  }

  public static async addTagToTagGroup(workspaceId: string, tagGroupId: string, tagId: string): Promise<void> {
    const ws = await BackendConnectorWorkspace(workspaceId)
    await ws.tag_groups.AddTagToTagGroup(tagGroupId, tagId)
  }
}
