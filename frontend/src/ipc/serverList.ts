export class IpcId {
  static readonly NAME_SPACE: string = "serverList";
  // ワークスペースdir選択イベント(finder/explorer表示)
  static readonly SELECT_NEW_WORKSPACE_DIR: string = IpcId.NAME_SPACE + "select-new-workspace-dir";
  static readonly SELECT_NEW_WORKSPACE_DIR_REPLY: string = IpcId.NAME_SPACE + "select-new-workspace-dir-reply";
  // ワークスペースを選択
  static readonly SELECT_WORKSPACE: string = IpcId.NAME_SPACE + "select-workspace";
  // コンテキストメニュー表示
  static readonly SHOW_CONTEXT_MENU: string = IpcId.NAME_SPACE + "show-context-menu";
  // ワークスペース削除モーダル表示
  static readonly SHOW_DELETE_WORKSPACE_MODAL_REPLY: string = IpcId.NAME_SPACE + "show-delete-workspace-modal";
  // リクエスト系
  static readonly CREATE_NEW_SERVER: string = IpcId.NAME_SPACE + "create-new-server";
  static readonly DELETE_WORKSPACE: string = IpcId.NAME_SPACE + "delete-workspace";
  static readonly FETCH_WORKSPACE_LIST: string = IpcId.NAME_SPACE + "fetch-server-list";
  static readonly FETCH_WORKSPACE_LIST_REPLY: string = IpcId.NAME_SPACE + "fetch-server-list-reply";
}

export type ServerInfo = {
  workspaceId: string
  name: string
  iconImagePath: string
  isAvailable: boolean
  isSelected: boolean
}

export type CreateWorkspaceInfo = {
  name: string
  dirName: string
  dirPath: string
}

export type ShowContextMenu = {
  workspaceId: string
}

export type SelectWorkspace = {
  workspaceId: string
}

export type DeleteWorkspace = {
  workspaceId: string
}
