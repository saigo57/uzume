export class IpcId {
  static readonly NAME_SPACE: string = "window_mode";
  static readonly BACKEND_INIT: string = IpcId.NAME_SPACE + "backend-init";
  static readonly BACKEND_RELOAD: string = IpcId.NAME_SPACE + "backend-reload";
  static readonly OPEN_BACKEND_APP_DIR: string = IpcId.NAME_SPACE + "open-backend-app-dir";
  static readonly BACKEND_INSTALL: string = IpcId.NAME_SPACE + "backend-install";
  static readonly FETCH_WINDOW_MODE: string = IpcId.NAME_SPACE + "fetch-window-mode";
  static readonly UZUME_MAIN_MODE_REPLY: string = IpcId.NAME_SPACE + "uzume-main-mode";
  static readonly BACKEND_NOTFOUND_REPLY: string = IpcId.NAME_SPACE + "backend-notfound";
}

export type BackendState = {
  host: string
  port: string
  isSupportedEnv: boolean
  installed: boolean
  defaultInstallDir: string
}
