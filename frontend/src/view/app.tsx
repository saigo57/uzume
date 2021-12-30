import React, { useState, useEffect, useRef} from 'react';
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useEvent } from './lib/eventCustomHooks';
import { useDraggableSplitBar } from './lib/draggableSplitBarHooks';
import { ServerList } from "./serverList";
import { MainMenu } from "./mainMenu";
import { ContentsArea } from "./contentsArea";
import { Footer } from "./footer";
import { IpcId as CurrWsIpcId, CurrentWorkspace } from "../ipc/currentWorkspace";
import {
  resetWorkspaceId as commonIpcResetWorkspaceId,
} from './commonIpc';
import { TagRenameModal } from './component/organisms/tagRenameModal';
import { TagGroupRenameModal } from './component/organisms/tagGroupRenameModal';

export function App() {
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
    window.api.on(CurrWsIpcId.GET_CURRENT_WORKSPACE_REPLY, (_e, arg) => {
      const serverList = JSON.parse(arg) as CurrentWorkspace
      setCurrentWorkspace(serverList);
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

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="container">
        <ServerList />
        <MainMenu
          workspaceId={currentWorkspaceState.workspace_id}
          workspaceName={currentWorkspaceState.workspace_name}
          currMode={currMode}
          onAction={onMenuAction}
          onSingleTagClick={raiseSingleTagClickEvent}
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
      </div>

      {/* 共通処理 */}
      <TagRenameModal />
      <TagGroupRenameModal />
    </DndProvider>
  );
}
