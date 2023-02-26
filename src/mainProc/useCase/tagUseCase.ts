import BackendConnectorWorkspace from './backendConnectorWorkspace'
import { TagInfo } from '../../ipc/tags'

export default class TagUseCase {
  public static async fetchAllTags(workspaceId: string): Promise<TagInfo[]> {
    const ws = await BackendConnectorWorkspace(workspaceId)
    const resTagList = await ws.tags.getList(false)
    const tags: TagInfo[] = []
    if (resTagList.tags !== null) {
      for (let i = 0; i < resTagList.tags.length; i++) {
        tags.push({
          tagId: resTagList.tags[i].tag_id,
          name: resTagList.tags[i].name,
          tagGroupId: resTagList.tags[i].tag_group_id,
          favorite: resTagList.tags[i].favorite,
        })
      }
    }
    return tags
  }

  public static async renameTag(workspaceId: string, tagId: string, tagName: string) {
    const ws = await BackendConnectorWorkspace(workspaceId)
    await ws.tags.renameTag(tagId, tagName)
  }

  public static async addFavorite(workspaceId: string, tagId: string) {
    const ws = await BackendConnectorWorkspace(workspaceId)
    await ws.tags.addFavorite(tagId)
  }

  public static async removeFavorite(workspaceId: string, tagId: string) {
    const ws = await BackendConnectorWorkspace(workspaceId)
    await ws.tags.removeFavorite(tagId)
  }

  public static async createNewTag(workspaceId: string, tagName: string): Promise<TagInfo> {
    const ws = await BackendConnectorWorkspace(workspaceId)
    const tagInfo = await ws.tags.createNewTag(tagName)
    return {
      tagId: tagInfo.tag_id,
      name: tagInfo.name,
      tagGroupId: tagInfo.tag_group_id,
      favorite: tagInfo.favorite,
    }
  }
}
