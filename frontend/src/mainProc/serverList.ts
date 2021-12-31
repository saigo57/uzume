import { ipcMain, dialog, BrowserWindow, Menu } from 'electron';
import {
  IpcId,
  ServerInfo,
  SelectWorkspace,
  CreateWorkspaceInfo,
  ShowContextMenu,
  AddWorkspaceInfo,
  FetchWorkspaceIcon,
  IconImageData,
  SetWorkspaceIcon,
} from '../ipc/serverList';
import BackendConnector from '../backendConnector/backendConnector';
import { changeCurrentWorkspace } from './currWorkspace'
import { showImagesReply } from './images'
const path = require('path');

let g_workspaceList: ServerInfo[] = []

// ワークスペース一覧取得
ipcMain.on(IpcId.FETCH_WORKSPACE_LIST, (e, _arg) => {
  fetchWorkspaceList(e, null as any)
});

// ワークスペース選択
ipcMain.on(IpcId.SELECT_WORKSPACE, (e, arg) => {
  let sw: SelectWorkspace = JSON.parse(arg)
  selectWorkspace(e, sw.workspaceId)
});

// ワークスペースを置くフォルダを選択
ipcMain.on(IpcId.SELECT_NEW_WORKSPACE_DIR, (e, _arg) => {
  let dirName = dialog.showOpenDialogSync(null as any, {
    properties: ['openDirectory'],
    title: 'Select a text file',
    defaultPath: '.',
  });
  e.reply(IpcId.SELECT_NEW_WORKSPACE_DIR_REPLY, dirName);
});

// 既存のワークスペースを選択
ipcMain.on(IpcId.SELECT_ADD_WORKSPACE_DIR, (e, _arg) => {
  let dirName = dialog.showOpenDialogSync(null as any, {
    properties: ['openDirectory'],
    title: 'Select a text file',
    defaultPath: '.',
  });
  e.reply(IpcId.SELECT_ADD_WORKSPACE_DIR_REPLY, dirName);
});

// 既存のワークスペースを選択
ipcMain.on(IpcId.SELECT_SET_WORKSPACE_ICON, (e, _arg) => {
  let dirName = dialog.showOpenDialogSync(null as any, {
    properties: ['openFile'],
    title: 'ワークスペースアイコン画像',
    defaultPath: '.',
  });
  e.reply(IpcId.SELECT_SET_WORKSPACE_ICON_REPLY, dirName);
});

// ワークスペースを新規作成
ipcMain.on(IpcId.CREATE_NEW_SERVER, (e, arg) => {
  let wsInfo: CreateWorkspaceInfo = JSON.parse(arg)
  BackendConnector.Workspace.create(
    wsInfo.name,
    path.join(wsInfo.dirPath, wsInfo.dirName + ".uzume")
  ).then((workspaceId) => {
    fetchWorkspaceList(e, workspaceId.workspace_id)
  });
});

// 既存ワークスペースを追加
ipcMain.on(IpcId.CREATE_ADD_SERVER, (e, arg) => {
  let wsInfo: AddWorkspaceInfo = JSON.parse(arg)
  BackendConnector.Workspace.add(
    wsInfo.dirPath
  ).then(() => {
    fetchWorkspaceList(e, null as any)
  });
});

// ワークスペースアイコンを設定
ipcMain.on(IpcId.SET_WORKSPACE_ICON, (e, arg) => {
  let setWorkspaceIcon: SetWorkspaceIcon = JSON.parse(arg)
  BackendConnector.workspace(setWorkspaceIcon.workspaceId, (ws) => {
    ws.postIcon(setWorkspaceIcon.iconPath).then(() => {
      fetchWorkspaceList(e, null as any)
    });
  })
});

ipcMain.on(IpcId.SHOW_CONTEXT_MENU, (e, arg) => {
  let msg: ShowContextMenu = JSON.parse(arg)

  const template: (Electron.MenuItemConstructorOptions | Electron.MenuItem)[] = [
    {
      label: 'リロード(未実装)',
      click: () => {
        // TODO: 後で実装
      }
    },
    {
      label: 'アイコンを設定',
      click: () => {
        showSelectWorkspaceIconModal(e, msg.workspaceId)
      }
    },
    { type: 'separator' },
    {
      label: 'アイコンを削除',
      click: () => {
        BackendConnector.workspace(msg.workspaceId, (ws) => {
          ws.deleteIcon().then(() => {
            fetchWorkspaceList(e, null as any)
          });
        })
      }
    },
    {
      label: 'ワークスペースを削除',
      click: () => {
        showDeleteWorkspaceModal(e, msg.workspaceId)
      }
    },
  ]
  const menu = Menu.buildFromTemplate(template)
  let contents: any = BrowserWindow.fromWebContents(e.sender)
  menu.popup(contents)
});

ipcMain.on(IpcId.DELETE_WORKSPACE, (e, arg) => {
  let msg: ShowContextMenu = JSON.parse(arg)

  BackendConnector.workspace(msg.workspaceId, (ws) => {
    ws.delete().then(() => {
      fetchWorkspaceList(e, null as any)
    });
  })
});

ipcMain.on(IpcId.DELETE_WORKSPACE, (e, arg) => {
  let msg: ShowContextMenu = JSON.parse(arg)

  BackendConnector.workspace(msg.workspaceId, (ws) => {
    ws.delete().then(() => {
      fetchWorkspaceList(e, null as any)
    });
  })
});

ipcMain.on(IpcId.FETCH_WORKSPACE_ICON, (e, arg) => {
  let msg: FetchWorkspaceIcon = JSON.parse(arg)

  BackendConnector.workspace(msg.workspaceId, (ws) => {
    ws.fetchIcon().then((imageBase64) => {
      let imageData: IconImageData = {
        workspaceId: msg.workspaceId,
        iconExists: true,
        imageBase64: imageBase64,
      }
      e.reply(IpcId.FETCH_WORKSPACE_ICON_REPLY, JSON.stringify(imageData));
    }).catch((err) => {
      if ( err.response.status == 404 ) {
        let imageData: IconImageData = {
          workspaceId: msg.workspaceId,
          iconExists: false,
          imageBase64: '',
        }
        e.reply(IpcId.FETCH_WORKSPACE_ICON_REPLY, JSON.stringify(imageData));
      } else {
        console.log(`icon error[${err.status}]`)
      }
    });
  })
});

// selectWorkspaceIdをnullにすると一番上を選択
function fetchWorkspaceList(e: Electron.IpcMainEvent, selectWorkspaceId: string) {
  BackendConnector.Workspace.getList().then((workspaceList) => {
    g_workspaceList = workspaceList.map((w) => {
      return {
        workspaceId: w.workspace_id,
        name: w.name,
        isAvailable: true,
        isSelected: false
      } as ServerInfo
    });
    if ( g_workspaceList.length > 0 ) {
      g_workspaceList[0].isSelected = true
    }

    if ( selectWorkspaceId ) {
      selectWorkspace(e, selectWorkspaceId)
    } else {
      replyWorkspaceList(e)
    }

    callChangeCurrentWorkspace(e)
  });
}

function replyWorkspaceList(e: Electron.IpcMainEvent) {
  e.reply(IpcId.FETCH_WORKSPACE_LIST_REPLY, JSON.stringify(g_workspaceList));
}

function selectWorkspace(e: Electron.IpcMainEvent, workspace_id: string) {
  g_workspaceList.forEach((w) => {
    if ( w.workspaceId == workspace_id ) {
      w.isSelected = true
    } else {
      w.isSelected = false
    }
  })

  replyWorkspaceList(e)
  callChangeCurrentWorkspace(e)
  showImagesReply(e, workspace_id, 1, [], '')
}

function callChangeCurrentWorkspace(e: Electron.IpcMainEvent) {
  g_workspaceList.forEach((w) => {
    if ( w.isSelected ) {
      changeCurrentWorkspace(e, w.workspaceId, w.name)
    }
  })
}

function showDeleteWorkspaceModal(e: Electron.IpcMainEvent, workspaceId: string) {
  for (let i = 0; i < g_workspaceList.length; i++) {
    if ( g_workspaceList[i].workspaceId != workspaceId ) continue;

    e.reply(IpcId.SHOW_DELETE_WORKSPACE_MODAL_REPLY, JSON.stringify(g_workspaceList[i]))
  }
}

function showSelectWorkspaceIconModal(e: Electron.IpcMainEvent, workspaceId: string) {
  for (let i = 0; i < g_workspaceList.length; i++) {
    if ( g_workspaceList[i].workspaceId != workspaceId ) continue;

    e.reply(IpcId.SHOW_SET_ICON_MODAL_REPLY, JSON.stringify(g_workspaceList[i]))
  }
}
