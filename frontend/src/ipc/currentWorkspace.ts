export class IpcId {
  static readonly NAME_SPACE: string = "currentWorkspace";
  static readonly GET_CURRENT_WORKSPACE_REPLY: string = IpcId.NAME_SPACE + "get-current-workspace-reply";
}

export type CurrentWorkspace = {
  workspace_name: string
  workspace_id: string
}
