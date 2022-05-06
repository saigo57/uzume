export default interface Api {
  send: (channel: string, ...args: any[]) => void;
  on: (channel: string, listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void) => void;
}

declare global {
  interface Window {
    api: Api;
    showConfirmModal: (message: string) => void;
  }
}
