import { ipcRenderer, contextBridge } from 'electron'

contextBridge.exposeInMainWorld('api', {
  send: (channel: string, ...args: any[]) => {
    ipcRenderer.send(channel, args)
  },
  on: (channel: string, listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void) => {
    ipcRenderer.on(channel, listener)
  },
})
