export const isIpcMainEvent = (item: any): item is Electron.IpcMainEvent => {
  return !!(item as Electron.IpcMainEvent)?.sender
}

export const isIpcMainInvokeEvent = (item: any): item is Electron.IpcMainInvokeEvent => {
  return !!(item as Electron.IpcMainInvokeEvent)?.sender
}
