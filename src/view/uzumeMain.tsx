import React, { useState, useEffect, useRef } from 'react'
import { useSetRecoilState } from 'recoil'
import { tagListAtom } from './recoil/tagListAtom'
import { tagGroupListAtom } from './recoil/tagGroupListAtom'
import { useEvent } from './lib/eventCustomHooks'
import { useDraggableSplitBar } from './lib/draggableSplitBarHooks'
import { WorkspaceList } from './workspaceList'
import { MainMenu } from './mainMenu'
import { ContentsArea } from './contentsArea'
import { Footer } from './footer'
import { IpcId as CurrWsIpcId, CurrentWorkspace } from '../ipc/currentWorkspace'
import { IpcId as TagGroupsIpcId, GetAllTagGroups, TagGroupList } from '../ipc/tagGroups'
import { IpcId as TagsIpcId, GetAllTags, TagList } from '../ipc/tags'
import { resetWorkspaceId as commonIpcResetWorkspaceId } from './commonIpc'

export function UzumeMain() {
  commonIpcResetWorkspaceId()

  const setTagAllList = useSetRecoilState(tagListAtom)
  const setTagGroupList = useSetRecoilState(tagGroupListAtom)
  const [currentWorkspaceState, setCurrentWorkspace] = useState<CurrentWorkspace>({
    workspace_name: '',
    workspace_id: '',
  })
  const [currMode, setCurrMode] = useState('home')

  const [showIndexImageEvent, raiseShowIndexImageEvent] = useEvent(() => {
    setCurrMode('home')
  })
  const [uncategorizedEvent, raiseUncategorizedEvent] = useEvent(() => {
    setCurrMode('uncategorized')
  })
  const [tagManageEvent, raiseTagManageEvent] = useEvent(() => {
    setCurrMode('tag_manage')
  })
  const [singleTagClickEvent, raiseSingleTagClickEvent] = useEvent(null)

  useEffect(() => {
    setCurrMode('home')
    raiseShowIndexImageEvent(null)

    if (currentWorkspaceState.workspace_id != '') {
      const req = {
        workspaceId: currentWorkspaceState.workspace_id,
      } as GetAllTagGroups

      window.api.invoke(TagGroupsIpcId.Invoke.GET_ALL_TAG_GROUPS, JSON.stringify(req)).then((arg: string) => {
        const tagGroupList = JSON.parse(arg) as TagGroupList
        setTagGroupList(tagGroupList.tag_groups)
      })
    }

    // TagContextMenuのイベントハンドラ
    // TODO: 対MainProcのイベントハンドラをまとめたい
    window.api.on(TagsIpcId.TagContextMenu.TAG_FAVORITE_CHANGED, (_e, _arg) => {
      const req = {
        workspaceId: currentWorkspaceState.workspace_id,
      } as GetAllTags

      window.api.invoke(TagsIpcId.Invoke.GET_ALL_TAGS, JSON.stringify(req)).then(arg => {
        const tagList = JSON.parse(arg) as TagList
        setTagAllList(tagList.tags)
      })
    })
  }, [currentWorkspaceState])

  useEffect(() => {
    window.api.on(CurrWsIpcId.ToRenderer.GET_CURRENT_WORKSPACE, (_e, arg) => {
      const workspaceList = JSON.parse(arg) as CurrentWorkspace
      setCurrentWorkspace(workspaceList)
    })
  }, [])

  const dsb_left = useRef<HTMLDivElement>(null)
  const dsb_split_bar = useRef<HTMLDivElement>(null)
  const dsb_right = useRef<HTMLDivElement>(null)
  useDraggableSplitBar(dsb_left, dsb_split_bar, dsb_right)

  const onMenuAction = (action: string) => {
    switch (action) {
      case 'home_click':
        raiseShowIndexImageEvent(null)
        break
      case 'uncategorized_click':
        raiseUncategorizedEvent(null)
        break
      case 'tag_manage_click':
        raiseTagManageEvent(null)
        break
    }
  }

  const onSingleTagClick = (tagId: string) => {
    raiseShowIndexImageEvent(null)
    raiseSingleTagClickEvent(tagId)
  }

  return (
    <>
      <WorkspaceList />
      <MainMenu
        workspaceId={currentWorkspaceState.workspace_id}
        workspaceName={currentWorkspaceState.workspace_name}
        currMode={currMode}
        onAction={onMenuAction}
        onSingleTagClick={onSingleTagClick}
        dsb_ref={dsb_left}
      />
      <div id="before-main" className="split-bar" ref={dsb_split_bar}></div>
      <ContentsArea
        workspaceId={currentWorkspaceState.workspace_id}
        uncategorized={currMode == 'uncategorized'}
        showIndexImageEvent={showIndexImageEvent}
        uncategorizedEvent={uncategorizedEvent}
        tagManageEvent={tagManageEvent}
        singleTagClickEvent={singleTagClickEvent}
        dsb_ref={dsb_right}
      />
      <Footer />
    </>
  )
}
