require('path')
import path from 'path'
import electron, { ipcMain } from 'electron'
import { IpcId, BackendState, BackendUrlHost } from '../ipc/backendSetup'
import { BackendConnector } from 'uzume-backend-connector'
import electronStore from 'electron-store'

const PLATFORM_MAC = 'darwin'
const PLATFORM_WIN = 'win32'
const BACKEND_DOWNLOAD_URL_BASE = 'https://uzume-prod.s3.ap-northeast-1.amazonaws.com/deploy/backend'

type Platform = {
  supported: boolean
  deployedBackendAppUrl: string
}

function currPlatformInfo(): Platform {
  const platform = {} as Platform

  switch (process.platform) {
    case PLATFORM_MAC:
      platform.supported = true
      platform.deployedBackendAppUrl = path.join(
        BACKEND_DOWNLOAD_URL_BASE,
        process.platform,
        `uzume-server-${BackendConnector.latestBackendVersion}.dmg`
      )
      break

    case PLATFORM_WIN:
      platform.supported = true
      platform.deployedBackendAppUrl = path.join(
        BACKEND_DOWNLOAD_URL_BASE,
        process.platform,
        `uzume-server-${BackendConnector.latestBackendVersion}.msi`
      )
      break

    default:
      platform.supported = false
      break
  }

  return platform
}

const BACKEND_HOST_KEY = 'backend_host'
const BACKEND_PORT_KEY = 'backend_port'

function backendHost(): string {
  if (process.env['E2E_TEST'] == 'true') return 'localhost'

  const store = new electronStore()
  if (!store.has(BACKEND_HOST_KEY)) {
    store.set(BACKEND_HOST_KEY, 'localhost')
  }

  return store.get(BACKEND_HOST_KEY) as string
}

function backendPort(): string {
  if (process.env['E2E_TEST'] == 'true') return '22112'

  const store = new electronStore()
  if (!store.has(BACKEND_PORT_KEY)) {
    store.set(BACKEND_PORT_KEY, '22113')
  }

  return store.get(BACKEND_PORT_KEY) as string
}

function backendUrl() {
  return `http://${backendHost()}:${backendPort()}/`
}

function moveToUzumeMainMode(e: Electron.IpcMainEvent) {
  e.reply(IpcId.ToRenderer.UZUME_MAIN_MODE)
}

function moveToBackendErrorMode(e: Electron.IpcMainEvent, is_version_ok: boolean) {
  const platform = currPlatformInfo()
  const state = {} as BackendState
  state.host = backendHost()
  state.port = backendPort()
  state.isSupportedEnv = !!platform.supported
  state.isVersionOk = is_version_ok

  e.reply(IpcId.ToRenderer.BACKEND_ERROR, JSON.stringify(state))
}

export function showBackendConfigModalParam(): string {
  const backendUrlHost = {} as BackendUrlHost
  backendUrlHost.host = backendHost()
  backendUrlHost.port = backendPort()
  return JSON.stringify(backendUrlHost)
}

ipcMain.on(IpcId.ToMainProc.BACKEND_INIT, (e, _arg) => {
  BackendConnector.resetStatus()
  BackendConnector.onBackendOk = () => {
    moveToUzumeMainMode(e)
  }
  BackendConnector.onBackendNotFound = () => {
    moveToBackendErrorMode(e, true)
  }
  BackendConnector.onBackendVersionError = () => {
    moveToBackendErrorMode(e, false)
  }
  BackendConnector.setBackendUrl(backendUrl())
})

ipcMain.on(IpcId.ToMainProc.BACKEND_CONFIG, (e, _arg) => {
  e.reply(IpcId.ToRenderer.SHOW_BACKEND_CONFIG_MODAL, showBackendConfigModalParam())
})

ipcMain.on(IpcId.ToMainProc.UPDATE_BACKEND_URL_HOST, (e, arg) => {
  const backendUrlHost = JSON.parse(arg) as BackendUrlHost
  const store = new electronStore()
  store.set(BACKEND_HOST_KEY, backendUrlHost.host)
  store.set(BACKEND_PORT_KEY, backendUrlHost.port)
  BackendConnector.resetStatus()
  BackendConnector.setBackendUrl(backendUrl())
  electron.BrowserWindow.getFocusedWindow()?.reload()
})

ipcMain.on(IpcId.ToMainProc.BACKEND_RELOAD, (_e, _arg) => {
  BackendConnector.resetStatus()
  BackendConnector.setBackendUrl(backendUrl())
})

ipcMain.on(IpcId.ToMainProc.BACKEND_DOWNLOAD, (_e, _arg) => {
  const platform = currPlatformInfo()
  electron.shell.openExternal(platform.deployedBackendAppUrl)
})
