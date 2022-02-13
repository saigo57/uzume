const fs = require('fs');
const path = require('path');
import { ipcMain, shell } from 'electron';
import {
  IpcId,
  BackendState,
} from '../ipc/windowMode';
import BackendConnector from '../backendConnector/backendConnector';

const PLATFORM_MAC = 'darwin';
const PLATFORM_WIN = 'win32';

type Platform = {
  supported: Boolean
  backendInstallDir: string
  tmpDir: string
  backendAppFileName: string
}

function currPlatformInfo(): Platform {
  var platform = {} as Platform

  switch ( process.platform ) {
    case PLATFORM_MAC:
      platform.supported = true
      platform.backendInstallDir = '/Applications'
      platform.tmpDir = '/tmp'
      platform.backendAppFileName = 'uzumeServer.app'
      break;

    case PLATFORM_WIN:
      let home = process.env['USERPROFILE']
      platform.supported = true
      platform.backendInstallDir = path.join(home, '.uzume')
      platform.tmpDir = path.join(home, 'AppData/Local/Temp')
      platform.backendAppFileName = 'uzumeServer.exe'
      break;

    default:
      platform.supported = false
      break;
  }

  return platform
}

function isExistFile(file: string): boolean {
  try {
    fs.statSync(file);
    return true
  } catch(err:any) {
    if(err.code === 'ENOENT') return false
  }

  return false
}

function backendUrl() {
  return 'http://localhost:22113/';
}

function moveToUzumeMainMode(e: Electron.IpcMainEvent) {
  e.reply(IpcId.UZUME_MAIN_MODE_REPLY)
}

function moveToBackendNotfoundMode(e: Electron.IpcMainEvent) {
  let platform = currPlatformInfo()
  var state = {} as BackendState
  state.host = 'localhost'
  state.port = '22113'
  state.defaultInstallDir = platform.backendInstallDir

  if ( platform.supported ) {
    let app_path = path.join(platform.backendInstallDir, platform.backendAppFileName)
    state.isSupportedEnv = true
    state.installed = isExistFile(app_path)
  } else {
    state.installed = false
    state.isSupportedEnv = false
  }

  e.reply(IpcId.BACKEND_NOTFOUND_REPLY, JSON.stringify(state))
}

ipcMain.on(IpcId.BACKEND_INIT, (e, _arg) => {
  BackendConnector.onBackendOk = () => {
    moveToUzumeMainMode(e)
  }
  BackendConnector.onBackendNotFound = () => {
    moveToBackendNotfoundMode(e)
  }
  BackendConnector.setBackendUrl(backendUrl());
});

ipcMain.on(IpcId.BACKEND_RELOAD, (e, _arg) => {
  BackendConnector.resetStatus();
  BackendConnector.setBackendUrl(backendUrl());
});

ipcMain.on(IpcId.BACKEND_INSTALL, (e, _arg) => {
  let platform = currPlatformInfo()
  // TODO: サーバーからバックエンドを落としてくる

  let tmp_app_path = path.join(platform.tmpDir, platform.backendAppFileName)
  let app_path = path.join(platform.backendInstallDir, platform.backendAppFileName)
  fs.copyFileSync(tmp_app_path, app_path);

  BackendConnector.resetStatus();
  BackendConnector.setBackendUrl(backendUrl());
});

ipcMain.on(IpcId.OPEN_BACKEND_APP_DIR, (_e, _arg) => {
  let platform = currPlatformInfo()
  shell.openPath(platform.backendInstallDir)
});
