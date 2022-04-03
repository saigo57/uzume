export class IpcId {
  static readonly NAME_SPACE: string = "window_mode";
  static readonly BACKEND_INIT: string = IpcId.NAME_SPACE + "backend-init";
  static readonly BACKEND_RELOAD: string = IpcId.NAME_SPACE + "backend-reload";
  static readonly BACKEND_DOWNLOAD: string = IpcId.NAME_SPACE + "backend-download";
  static readonly FETCH_WINDOW_MODE: string = IpcId.NAME_SPACE + "fetch-window-mode";
  static readonly UZUME_MAIN_MODE_REPLY: string = IpcId.NAME_SPACE + "uzume-main-mode";
  static readonly BACKEND_ERROR_REPLY: string = IpcId.NAME_SPACE + "backend-error-reply";
}

export type BackendState = {
  host: string
  port: string
  isSupportedEnv: boolean
  isVersionOk: boolean
}
