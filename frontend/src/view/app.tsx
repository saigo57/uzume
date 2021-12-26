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

  useEffect(() => {
    setCurrMode('home')
    raiseShowIndexImageEvent();
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
      case 'home_click': raiseShowIndexImageEvent(); break;
      case 'uncategorized_click': raiseUncategorizedEvent(); break;
      case 'tag_manage_click': raiseTagManageEvent(); break;
    }
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="container">
        <ServerList />
        <MainMenu workspaceName={currentWorkspaceState.workspace_name} currMode={currMode} onAction={onMenuAction} dsb_ref={dsb_left} />
        <div id="before-main" className="split-bar" ref={dsb_split_bar}></div>
        <ContentsArea
          workspaceId={currentWorkspaceState.workspace_id}
          uncategorized={currMode == 'uncategorized'}
          showIndexImageEvent={showIndexImageEvent}
          uncategorizedEvent={uncategorizedEvent}
          tagManageEvent={tagManageEvent}
          dsb_ref={dsb_right}
        />
        <Footer />
      </div>

      {/* 共通処理 */}
      <TagRenameModal />
    </DndProvider>
  );
}
