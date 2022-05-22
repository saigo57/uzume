import { IpcIdBase } from './ipcIdBase'
import { BrowserWindow } from 'electron'

export class IpcId extends IpcIdBase {
  static readonly NAME_SPACE: string = 'footer'

  public static ToRenderer = class {
    static readonly FOOTER_MESSAGE_REPLY: string = IpcId.generateIpcId()
  }
}

export type FooterMessage = {
  message: string
}

function zeroPadding(num: number, len: number) {
  return (Array(len).join('0') + num).slice(-len)
}

function buildMessage(message: string): FooterMessage {
  const dateNow = new Date()
  const monthStr = zeroPadding(dateNow.getMonth() + 1, 2)
  const dateStr = zeroPadding(dateNow.getDate() + 1, 2)
  const hoursStr = zeroPadding(dateNow.getHours() + 1, 2)
  const minutesStr = zeroPadding(dateNow.getMinutes() + 1, 2)
  const nowStr = `${dateNow.getFullYear()}/${monthStr}/${dateStr} ${hoursStr}:${minutesStr}.${dateNow.getSeconds()}`
  return {
    message: `${nowStr} ${message}`,
  }
}

export function showFooterMessage(e: Electron.IpcMainEvent, message: string) {
  e.reply(IpcId.ToRenderer.FOOTER_MESSAGE_REPLY, JSON.stringify(buildMessage(message)))
}

export function showFooterMessageByBrowserWindow(win: BrowserWindow, message: string) {
  win.webContents.send(IpcId.ToRenderer.FOOTER_MESSAGE_REPLY, JSON.stringify(buildMessage(message)))
}
