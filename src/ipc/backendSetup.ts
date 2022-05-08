import { IpcIdBase } from './ipcIdBase';

export class IpcId extends IpcIdBase {
  static readonly NAME_SPACE: string = "backendSetup";

  public static ToMainProc = class {
    static readonly BACKEND_INIT: string = IpcId.generateIpcId();
    static readonly BACKEND_RELOAD: string = IpcId.generateIpcId();
    static readonly BACKEND_DOWNLOAD: string = IpcId.generateIpcId();
    static readonly BACKEND_CONFIG: string = IpcId.generateIpcId();
    static readonly UPDATE_BACKEND_URL_HOST: string = IpcId.generateIpcId();
  }

  public static ToRenderer = class {
    static readonly UZUME_MAIN_MODE: string = IpcId.generateIpcId();
    static readonly BACKEND_ERROR: string = IpcId.generateIpcId();
    static readonly SHOW_BACKEND_CONFIG_MODAL: string = IpcId.generateIpcId();
  }
}

export type BackendState = {
  host: string
  port: string
  isSupportedEnv: boolean
  isVersionOk: boolean
}

export type BackendUrlHost = {
  host: string
  port: string
}
