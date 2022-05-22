import { useState, useEffect } from 'react'
import { IpcId as TagsIpcId, TagInfo, TagList } from '../../ipc/tags'
import { IpcId as TagGroupsIpcId, GetAllTagGroups, TagGroupInfo, TagGroupList } from '../../ipc/tagGroups'
import { sendIpcGetAllTags } from '../commonIpc'

export class MenuItem {
  static readonly ALL_TAG = 'all_tag'
  static readonly UNCATEGORIZED_TAG = 'uncategorized_tag'
  // その他はTagGroup
}

export const useTags = (
  workspaceId: string
): [TagGroupInfo[], TagInfo[], TagInfo[], () => void, string, (menu: string) => void] => {
  const [tagGroupListState, setTagGroupList] = useState([] as TagGroupInfo[])
  const [tagAllListState, setTagAllList] = useState([] as TagInfo[])
  const [showingTagAllListState, setShowingTagAllList] = useState([] as TagInfo[])
  const [selectingMenu, setSelectingMenu] = useState(MenuItem.ALL_TAG)

  useEffect(() => {
    if (workspaceId == '') return

    setSelectingMenu(MenuItem.ALL_TAG)
    sendIpcGetAllTags(workspaceId)

    const req = {
      workspaceId: workspaceId,
    } as GetAllTagGroups

    window.api.send(TagGroupsIpcId.ToMainProc.GET_ALL_TAG_GROUPS, JSON.stringify(req))
  }, [workspaceId])

  useEffect(() => {
    window.api.on(TagsIpcId.ToRenderer.GET_ALL_TAGS, (_e, arg) => {
      const tagList = JSON.parse(arg) as TagList
      setTagAllList(tagList.tags)
    })
  }, [])

  useEffect(() => {
    window.api.on(TagGroupsIpcId.ToRenderer.GET_ALL_TAG_GROUPS, (_e, arg) => {
      const tagGroupList = JSON.parse(arg) as TagGroupList
      setTagGroupList(tagGroupList.tag_groups)
    })
  }, [])

  useEffect(() => {
    switch (selectingMenu) {
      case MenuItem.ALL_TAG:
        setShowingTagAllList(tagAllListState)
        break

      case MenuItem.UNCATEGORIZED_TAG:
        setShowingTagAllList(tagAllListState.filter(tag => tag.tagGroupId.length == 0))
        break

      default: // 各タググループが選択されている
        setShowingTagAllList(tagAllListState.filter(tag => tag.tagGroupId == selectingMenu))
        break
    }
  }, [tagAllListState, selectingMenu])

  const resetTagList = () => {
    setTagAllList([])
  }

  const selectMenu = (menu: string) => {
    setSelectingMenu(menu)
  }

  return [tagGroupListState, tagAllListState, showingTagAllListState, resetTagList, selectingMenu, selectMenu]
}
