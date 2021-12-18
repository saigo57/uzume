import React, { useState, useEffect} from 'react';
import { ServerList } from "./serverList";
import { MainMenu } from "./mainMenu";
import { ContentsArea } from "./contentsArea";
import { Footer } from "./footer";
import { IpcId as CurrWsIpcId, CurrentWorkspace } from "../ipc/currentWorkspace";

export function App() {
  const [currentWorkspaceState, setCurrentWorkspace] = useState<CurrentWorkspace>({
    workspace_name: '',
    workspace_id: '',
  });
  const [currMode, setCurrMode] = useState('home');

  // イベント
  const [showIndexImageEvent, setShowIndexImageEvent] = useState(0)
  const raiseShowIndexImageEvent = () => {
    setCurrMode('home')
    setShowIndexImageEvent(prev => prev + 1)
  };
  const [uncategorizedEvent, setUncategorizedEvent] = useState(0)
  const raiseUncategorizedEvent = () => {
    setCurrMode('uncategorized')
    setUncategorizedEvent(prev => prev + 1)
  };

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

  const onMenuAction = (action: string) => {
    switch ( action ) {
      case 'home_click': raiseShowIndexImageEvent(); break;
      case 'uncategorized_click': raiseUncategorizedEvent(); break;
    }
  }

  return (
    <div className="container">
      <ServerList />
      <MainMenu workspaceName={currentWorkspaceState.workspace_name} currMode={currMode} onAction={onMenuAction} />
      <div id="before-main" className="split-bar"></div>
      <ContentsArea
        workspaceId={currentWorkspaceState.workspace_id}
        uncategorized={currMode == 'uncategorized'}
        showIndexImageEvent={showIndexImageEvent}
        uncategorizedEvent={uncategorizedEvent} />
      <Footer />
    </div>
  );
}
