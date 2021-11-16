import React, { useState, useEffect} from 'react';
import { ServerList } from "./serverList";
import { MainMenu } from "./mainMenu";
import { ContentsArea } from "./contentsArea";
import { Footer } from "./footer";
import { IpcId as CurrWsIpcId, CurrentWorkspace } from "../ipc/currentWorkspace";

export function App() {
  const [currentWorkspaceState, setCurrentWorkspace] = useState<CurrentWorkspace>({
    workspace_name: '',
    workspace_id: ''
  });

  useEffect(() => {
    window.api.on(CurrWsIpcId.GET_CURRENT_WORKSPACE_REPLY, (_e, arg) => {
      const serverList = JSON.parse(arg) as CurrentWorkspace
      setCurrentWorkspace(serverList);
    });
  }, []);

  return (
    <div className="container">
      <ServerList />
      <MainMenu workspaceName={currentWorkspaceState.workspace_name} />
      <div id="before-main" className="split-bar"></div>
      <ContentsArea />
      <Footer />
    </div>
  );
}
