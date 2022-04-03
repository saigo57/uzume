const fs = require('fs');
const path = require('path');
import electron, { app, ipcMain } from 'electron';
import {
  IpcId,
  BackendState,
} from '../ipc/windowMode';
import BackendConnector from '../backendConnector/backendConnector';

const PLATFORM_MAC = 'darwin';
const PLATFORM_WIN = 'win32';
const BACKEND_DOWNLOAD_URL_BASE = 'https://uzume.s3.ap-northeast-1.amazonaws.com/deploy/backend';

type Platform = {
  supported: Boolean
  deployedBackendAppUrl: string
}

function currPlatformInfo(): Platform {
  var platform = {} as Platform

  switch ( process.platform ) {
    case PLATFORM_MAC:
      platform.supported = true
      platform.deployedBackendAppUrl = path.join(BACKEND_DOWNLOAD_URL_BASE, process.platform, `uzume-server-${BackendConnector.latestBackendVersion}.dmg`)
      break;

    case PLATFORM_WIN:
      platform.supported = true
      platform.deployedBackendAppUrl = path.join(BACKEND_DOWNLOAD_URL_BASE, process.platform, `uzume-server-${BackendConnector.latestBackendVersion}.msi`)
      break;

    default:
      platform.supported = false
      break;
  }

  return platform
}

function backendUrl() {
  return 'http://localhost:22113/';
}

function moveToUzumeMainMode(e: Electron.IpcMainEvent) {
  e.reply(IpcId.UZUME_MAIN_MODE_REPLY)
}

function moveToBackendErrorMode(e: Electron.IpcMainEvent, is_version_ok: boolean) {
  let platform = currPlatformInfo()
  var state = {} as BackendState
  state.host = 'localhost'
  state.port = '22113'
  state.isSupportedEnv = !!platform.supported
  state.isVersionOk = is_version_ok

  e.reply(IpcId.BACKEND_ERROR_REPLY, JSON.stringify(state))
}

ipcMain.on(IpcId.BACKEND_INIT, (e, _arg) => {
  BackendConnector.onBackendOk = () => {
    moveToUzumeMainMode(e)
  }
  BackendConnector.onBackendNotFound = () => {
    moveToBackendErrorMode(e, true)
  }
  BackendConnector.onBackendVersionError = () => {
    moveToBackendErrorMode(e, false)
  }
  BackendConnector.setBackendUrl(backendUrl());
});

ipcMain.on(IpcId.BACKEND_RELOAD, (e, _arg) => {
  BackendConnector.resetStatus();
  BackendConnector.setBackendUrl(backendUrl());
});

ipcMain.on(IpcId.BACKEND_DOWNLOAD, (e, _arg) => {
  let platform = currPlatformInfo()
  electron.shell.openExternal(platform.deployedBackendAppUrl)
});
