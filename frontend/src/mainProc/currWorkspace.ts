import { IpcId, CurrentWorkspace } from '../ipc/currentWorkspace';
import BackendConnector from '../backendConnector/backendConnector';

let g_currentWorkspace: CurrentWorkspace = {
  workspace_name: '',
  workspace_id: '',
}

export function changeCurrentWorkspace(e: Electron.IpcMainEvent, workspaceId: string, name: string) {

  BackendConnector.workspace(workspaceId, (ws) => {
    g_currentWorkspace.workspace_id = workspaceId
    g_currentWorkspace.workspace_name = name
  
    e.reply(IpcId.GET_CURRENT_WORKSPACE_REPLY, JSON.stringify(g_currentWorkspace));
  });
}
