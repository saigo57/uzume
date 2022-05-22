import { IpcIdBase } from './ipcIdBase'

export class IpcId extends IpcIdBase {
  static readonly NAME_SPACE: string = 'workspaceList'

  public static ToMainProc = class {
    // ワークスペースdir選択イベント(finder/explorer表示)
    static readonly SELECT_NEW_WORKSPACE_DIR: string = IpcId.generateIpcId()
    // ワークスペースdir選択イベント(finder/explorer表示)
    static readonly SELECT_ADD_WORKSPACE_DIR: string = IpcId.generateIpcId()
    // ワークスペースアイコン選択イベント(finder/explorer表示)
    static readonly SELECT_SET_WORKSPACE_ICON: string = IpcId.generateIpcId()
    // ワークスペースを選択
    static readonly SELECT_WORKSPACE: string = IpcId.generateIpcId()
    // コンテキストメニュー表示
    static readonly SHOW_CONTEXT_MENU: string = IpcId.generateIpcId()
    // リクエスト系
    static readonly CREATE_NEW_WORKSPACE: string = IpcId.generateIpcId()
    static readonly CREATE_ADD_WORKSPACE: string = IpcId.generateIpcId()
    static readonly DELETE_WORKSPACE: string = IpcId.generateIpcId()
    static readonly FETCH_WORKSPACE_LIST: string = IpcId.generateIpcId()
    static readonly FETCH_WORKSPACE_ICON: string = IpcId.generateIpcId()
    static readonly SET_WORKSPACE_ICON: string = IpcId.generateIpcId()
    static readonly UPDATE_WORKSPACE_NAME: string = IpcId.generateIpcId()
  }

  public static ToRenderer = class {
    // ToMainProcと対応
    static readonly SELECT_NEW_WORKSPACE_DIR: string = IpcId.generateIpcId()
    static readonly SELECT_ADD_WORKSPACE_DIR: string = IpcId.generateIpcId()
    static readonly SELECT_SET_WORKSPACE_ICON: string = IpcId.generateIpcId()
    static readonly FETCH_WORKSPACE_LIST: string = IpcId.generateIpcId()
    static readonly FETCH_WORKSPACE_ICON: string = IpcId.generateIpcId()
    // ワークスペース削除モーダル表示
    static readonly SHOW_DELETE_WORKSPACE_MODAL: string = IpcId.generateIpcId()
    // ワークスペースアイコン設定モーダル表示
    static readonly SHOW_SET_ICON_MODAL: string = IpcId.generateIpcId()
    // ワークスペース名更新モーダル表示
    static readonly SHOW_UPDATE_WORKSPACE_NAME_MODAL: string = IpcId.generateIpcId()
  }
}

export type WorkspaceInfo = {
  workspaceId: string
  name: string
  isAvailable: boolean
  isSelected: boolean
}

export type CreateWorkspaceInfo = {
  dirName: string
  dirPath: string
}

export type AddWorkspaceInfo = {
  dirPath: string
}

export type ShowContextMenu = {
  workspaceId: string
  is_available: boolean
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

export type UpdateWorkspaceName = {
  workspaceId: string
  name: string
}
