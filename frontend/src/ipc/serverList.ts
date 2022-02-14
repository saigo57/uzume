export class IpcId {
  static readonly NAME_SPACE: string = "serverList";
  // ワークスペースdir選択イベント(finder/explorer表示)
  static readonly SELECT_NEW_WORKSPACE_DIR: string = IpcId.NAME_SPACE + "select-new-workspace-dir";
  static readonly SELECT_NEW_WORKSPACE_DIR_REPLY: string = IpcId.NAME_SPACE + "select-new-workspace-dir-reply";
  // ワークスペースdir選択イベント(finder/explorer表示)
  static readonly SELECT_ADD_WORKSPACE_DIR: string = IpcId.NAME_SPACE + "select-add-workspace-dir";
  static readonly SELECT_ADD_WORKSPACE_DIR_REPLY: string = IpcId.NAME_SPACE + "select-add-workspace-dir-reply";
  // ワークスペースアイコン選択イベント(finder/explorer表示)
  static readonly SELECT_SET_WORKSPACE_ICON: string = IpcId.NAME_SPACE + "select-set-workspace-icon-dir";
  static readonly SELECT_SET_WORKSPACE_ICON_REPLY: string = IpcId.NAME_SPACE + "select-set-workspace-icon-reply";
  // ワークスペースを選択
  static readonly SELECT_WORKSPACE: string = IpcId.NAME_SPACE + "select-workspace";
  // コンテキストメニュー表示
  static readonly SHOW_CONTEXT_MENU: string = IpcId.NAME_SPACE + "show-context-menu";
  // ワークスペース削除モーダル表示
  static readonly SHOW_DELETE_WORKSPACE_MODAL_REPLY: string = IpcId.NAME_SPACE + "show-delete-workspace-modal-reply";
  // ワークスペースアイコン設定モーダル表示
  static readonly SHOW_SET_ICON_MODAL_REPLY: string = IpcId.NAME_SPACE + "show-set-icon-modal-reply";
  // リクエスト系
  static readonly CREATE_NEW_SERVER: string = IpcId.NAME_SPACE + "create-new-server";
  static readonly CREATE_ADD_SERVER: string = IpcId.NAME_SPACE + "create-add-server";
  static readonly DELETE_WORKSPACE: string = IpcId.NAME_SPACE + "delete-workspace";
  static readonly FETCH_WORKSPACE_LIST: string = IpcId.NAME_SPACE + "fetch-server-list";
  static readonly FETCH_WORKSPACE_LIST_REPLY: string = IpcId.NAME_SPACE + "fetch-server-list-reply";
  static readonly FETCH_WORKSPACE_ICON: string = IpcId.NAME_SPACE + "fetch-server-icon";
  static readonly FETCH_WORKSPACE_ICON_REPLY: string = IpcId.NAME_SPACE + "fetch-server-icon-reply";
  static readonly SET_WORKSPACE_ICON: string = IpcId.NAME_SPACE + "set-server-icon";
}

export type ServerInfo = {
  workspaceId: string
  name: string
  isAvailable: boolean
  isSelected: boolean
}

export type CreateWorkspaceInfo = {
  name: string
  dirName: string
  dirPath: string
}

export type AddWorkspaceInfo = {
  dirPath: string
}

export type ShowContextMenu = {
  workspaceId: string,
  is_available: boolean,
}

export type SelectWorkspace = {
  workspaceId: string
}

export type DeleteWorkspace = {
  workspaceId: string
}

export type FetchWorkspaceIcon = {
  workspaceId: string
}

export type IconImageData = {
  workspaceId: string
  iconExists: boolean
  imageBase64: string
}

export type SetWorkspaceIcon = {
  workspaceId: string
  iconPath: string
}
