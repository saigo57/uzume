import React, { useState, useEffect, useRef} from 'react';
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { ConfirmModal } from './component/organisms/confirmModal';
import { TagRenameModal } from './component/organisms/tagRenameModal';
import { TagGroupRenameModal } from './component/organisms/tagGroupRenameModal';
import { AppUpdateModal } from './component/organisms/appUpdateModal';
import { UzumeMain } from './uzumeMain';
import { BackendSetup } from './backendSetup';
import {
  IpcId as WindowModeIpcId,
  BackendState,
} from "../ipc/windowMode";

const WINDOW_MODE = {
  INIT: "init",
  UZUME_MAIN: "uzume_main",
  BACKEND_ERROR: "backend_notfound",
} as const;
type WindowMode = typeof WINDOW_MODE[keyof typeof WINDOW_MODE];

export function App() {
  const [windowMode, setWindowMode] = useState(WINDOW_MODE.INIT as WindowMode);
  const [backendState, setBackendState] = useState({} as BackendState);
  const [confirmMessage, setConfirmMessage] = useState(null as string | null);

  useEffect(() => {
    // 初期化
    window.showConfirmModal = (message: string) => {
      setConfirmMessage(message)
    }
    // 初期処理
    window.api.on(WindowModeIpcId.UZUME_MAIN_MODE_REPLY, (_e, _arg) => {
      setWindowMode(WINDOW_MODE.UZUME_MAIN);
    });
    window.api.on(WindowModeIpcId.BACKEND_ERROR_REPLY, (_e, arg) => {
      const state = JSON.parse(arg) as BackendState;
      setBackendState(state);
      setWindowMode(WINDOW_MODE.BACKEND_ERROR);
    });
    window.api.send(WindowModeIpcId.BACKEND_INIT);
  }, []);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="container">
        {(()=> {
          switch ( windowMode ) {
            case WINDOW_MODE.INIT:
              return <div>読込中</div>

            case WINDOW_MODE.BACKEND_ERROR:
              return <BackendSetup backendState={backendState} />

            case WINDOW_MODE.UZUME_MAIN:
              return <UzumeMain />
          }
        })()}
      </div>

      {/* 共通処理 */}
      <ConfirmModal display={confirmMessage != null} message={confirmMessage || ''} onClose={() => { setConfirmMessage(null)} } />
      <TagRenameModal />
      <TagGroupRenameModal />
      <AppUpdateModal />
    </DndProvider>
  );
}
