import { IpcId, CurrentWorkspace } from '../ipc/currentWorkspace';
import { BackendConnector } from 'uzume-backend-connector';
import { Globals } from './globals';

export function changeCurrentWorkspace(e: Electron.IpcMainEvent, workspaceId: string, name: string) {
  BackendConnector.workspace(workspaceId, (ws) => {
    Globals.currentWorkspace.workspace_id = workspaceId
    Globals.currentWorkspace.workspace_name = name
  
    e.reply(IpcId.ToRenderer.GET_CURRENT_WORKSPACE, JSON.stringify(Globals.currentWorkspace));
  });
}

export function isCurrentWorkspace(workspace_id: string): boolean {
  return Globals.currentWorkspace.workspace_id == workspace_id
}
