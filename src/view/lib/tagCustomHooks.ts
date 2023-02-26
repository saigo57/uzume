import { useState, useEffect } from 'react'
import { useRecoilState } from 'recoil'
import { tagListAtom } from '../recoil/tagListAtom'
import { IpcId as TagsIpcId, TagInfo, ShowContextMenu } from '../../ipc/tags'
import { sendIpcGetAllTags } from '../commonIpc'

export class MenuItem {
  static readonly ALL_TAG = 'all_tag'
  static readonly UNCATEGORIZED_TAG = 'uncategorized_tag'
  // その他はTagGroup
}

export const useTags = (workspaceId: string): [TagInfo[], TagInfo[], () => void, string, (menu: string) => void] => {
  const [tagAllListState, setTagAllList] = useRecoilState(tagListAtom)
  const [showingTagAllListState, setShowingTagAllList] = useState([] as TagInfo[])
  const [selectingMenu, setSelectingMenu] = useState(MenuItem.ALL_TAG)

  useEffect(() => {
    if (workspaceId == '') return

    setSelectingMenu(MenuItem.ALL_TAG)
    sendIpcGetAllTags(workspaceId, setTagAllList)
  }, [workspaceId])

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

  return [tagAllListState, showingTagAllListState, resetTagList, selectingMenu, selectMenu]
}

export const createOnContextMenu = (req: ShowContextMenu) => {
  return () => {
    if (!req) return

    window.api.send(TagsIpcId.TagContextMenu.SHOW_CONTEXT_MENU, JSON.stringify(req))
  }
}
