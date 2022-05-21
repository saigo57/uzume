import React, { useState, useEffect, useRef} from 'react';
import { useEvent } from './lib/eventCustomHooks';
import { useDraggableSplitBar } from './lib/draggableSplitBarHooks';
import { WorkspaceList } from "./workspaceList";
import { MainMenu } from "./mainMenu";
import { ContentsArea } from "./contentsArea";
import { Footer } from "./footer";
import { IpcId as CurrWsIpcId, CurrentWorkspace } from "../ipc/currentWorkspace";
import {
  resetWorkspaceId as commonIpcResetWorkspaceId,
} from './commonIpc';

export function UzumeMain() {
  commonIpcResetWorkspaceId();

  const [currentWorkspaceState, setCurrentWorkspace] = useState<CurrentWorkspace>({
    workspace_name: '',
    workspace_id: '',
  });
  const [currMode, setCurrMode] = useState('home');

  const [showIndexImageEvent, raiseShowIndexImageEvent] = useEvent(() => {
    setCurrMode('home');
  });
  const [uncategorizedEvent, raiseUncategorizedEvent] = useEvent(() => {
    setCurrMode('uncategorized');
  });
  const [tagManageEvent, raiseTagManageEvent] = useEvent(() => {
    setCurrMode('tag_manage');
  });
  const [singleTagClickEvent, raiseSingleTagClickEvent] = useEvent(null);

  useEffect(() => {
    setCurrMode('home')
    raiseShowIndexImageEvent(null);
  }, [currentWorkspaceState]);

  useEffect(() => {
    window.api.on(CurrWsIpcId.ToRenderer.GET_CURRENT_WORKSPACE, (_e, arg) => {
      const workspaceList = JSON.parse(arg) as CurrentWorkspace
      setCurrentWorkspace(workspaceList);
    });
  }, []);

  const dsb_left = useRef<HTMLDivElement>(null);
  const dsb_split_bar = useRef<HTMLDivElement>(null);
  const dsb_right = useRef<HTMLDivElement>(null);
  useDraggableSplitBar(dsb_left, dsb_split_bar, dsb_right)

  const onMenuAction = (action: string) => {
    switch ( action ) {
      case 'home_click': raiseShowIndexImageEvent(null); break;
      case 'uncategorized_click': raiseUncategorizedEvent(null); break;
      case 'tag_manage_click': raiseTagManageEvent(null); break;
    }
  }

  const onSingleTagClick = (tagId: string) => {
    raiseShowIndexImageEvent(null);
    raiseSingleTagClickEvent(tagId);
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
  );
}
