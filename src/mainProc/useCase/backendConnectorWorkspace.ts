import { BackendConnector, Workspace } from 'uzume-backend-connector'

export default function BackendConnectorWorkspace(workspace_id: string): Promise<Workspace> {
  return new Promise(resolve => {
    BackendConnector.workspace(workspace_id, ws => {
      resolve(ws)
    })
  })
}
