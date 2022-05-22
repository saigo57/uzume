import { IpcIdBase } from './ipcIdBase'

export class IpcId extends IpcIdBase {
  static readonly NAME_SPACE: string = 'currentWorkspace'

  public static ToRenderer = class {
    static readonly GET_CURRENT_WORKSPACE: string = IpcId.generateIpcId()
  }
}

export type CurrentWorkspace = {
  workspace_name: string
  workspace_id: string
}
