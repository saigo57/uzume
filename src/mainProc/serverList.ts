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
  UpdateWorkspaceName,
} from '../ipc/serverList';
import { BackendConnector } from 'uzume-backend-connector';
import { changeCurrentWorkspace } from './currWorkspace'
import { showImagesReply } from './images'
const path = require('path');
import { showFooterMessage } from '../ipc/footer';
import { Globals } from './globals';

// ワークスペース一覧取得
ipcMain.on(IpcId.ToMainProc.FETCH_WORKSPACE_LIST, (e, _arg) => {
  fetchWorkspaceList(e, null as any)
});

// ワークスペース選択
ipcMain.on(IpcId.ToMainProc.SELECT_WORKSPACE, (e, arg) => {
  let sw: SelectWorkspace = JSON.parse(arg)
  selectWorkspace(e, sw.workspaceId)
});

// ワークスペースを置くフォルダを選択
ipcMain.on(IpcId.ToMainProc.SELECT_NEW_WORKSPACE_DIR, (e, _arg) => {
  let dirName = dialog.showOpenDialogSync(null as any, {
    properties: ['openDirectory'],
    title: 'Select a text file',
    defaultPath: '.',
  });
  e.reply(IpcId.ToRenderer.SELECT_NEW_WORKSPACE_DIR, dirName);
});

// 既存のワークスペースを選択
ipcMain.on(IpcId.ToMainProc.SELECT_ADD_WORKSPACE_DIR, (e, _arg) => {
  let dirName = dialog.showOpenDialogSync(null as any, {
    properties: ['openDirectory'],
    title: 'Select a text file',
    defaultPath: '.',
  });
  e.reply(IpcId.ToRenderer.SELECT_ADD_WORKSPACE_DIR, dirName);
});

// 既存のワークスペースを選択
ipcMain.on(IpcId.ToMainProc.SELECT_SET_WORKSPACE_ICON, (e, _arg) => {
  let dirName = dialog.showOpenDialogSync(null as any, {
    properties: ['openFile'],
    title: 'ワークスペースアイコン画像',
    defaultPath: '.',
  });
  e.reply(IpcId.ToRenderer.SELECT_SET_WORKSPACE_ICON, dirName);
});

// ワークスペースを新規作成
ipcMain.on(IpcId.ToMainProc.CREATE_NEW_SERVER, (e, arg) => {
  let wsInfo: CreateWorkspaceInfo = JSON.parse(arg)
  BackendConnector.Workspace.create(
    wsInfo.dirName, // 一旦ディレクトリ名と同じにする
    path.join(wsInfo.dirPath, wsInfo.dirName + ".uzume")
  ).then((workspaceId) => {
    fetchWorkspaceList(e, workspaceId.workspace_id)
  }).catch((err) => {
    showFooterMessage(e, `ワークスペースの新規作成に失敗しました。[${err}}]`);
  });
});

// 既存ワークスペースを追加
ipcMain.on(IpcId.ToMainProc.CREATE_ADD_SERVER, (e, arg) => {
  let wsInfo: AddWorkspaceInfo = JSON.parse(arg)
  BackendConnector.Workspace.add(
    wsInfo.dirPath
  ).then(() => {
    fetchWorkspaceList(e, null as any)
  }).catch((err) => {
    showFooterMessage(e, `既存ワークスペースの追加に失敗しました。[${err}}]`);
  });
});

// ワークスペースアイコンを設定
ipcMain.on(IpcId.ToMainProc.SET_WORKSPACE_ICON, (e, arg) => {
  let setWorkspaceIcon: SetWorkspaceIcon = JSON.parse(arg)
  BackendConnector.workspace(setWorkspaceIcon.workspaceId, (ws) => {
    ws.postIcon(setWorkspaceIcon.iconPath).then(() => {
      fetchWorkspaceList(e, null as any)
    }).catch((err) => {
      showFooterMessage(e, `ワークスペースアイコンの設定に失敗しました。[${err}}]`);
    });
  })
});

// ワークスペース名を変更
ipcMain.on(IpcId.ToMainProc.UPDATE_WORKSPACE_NAME, (e, arg) => {
  let updateWorkspaceName: UpdateWorkspaceName = JSON.parse(arg)
  BackendConnector.workspace(updateWorkspaceName.workspaceId, (ws) => {
    ws.update(updateWorkspaceName.name).then(() => {
      fetchWorkspaceList(e, updateWorkspaceName.workspaceId)
    }).catch((err) => {
      showFooterMessage(e, `ワークスペース名の変更に失敗しました。[${err}}]`);
    });
  })
});

ipcMain.on(IpcId.ToMainProc.SHOW_CONTEXT_MENU, (e, arg) => {
  let msg: ShowContextMenu = JSON.parse(arg)

  const template: (Electron.MenuItemConstructorOptions | Electron.MenuItem)[] = []

  let item_reload = {
    label: 'リロード',
    click: () => {
      BackendConnector.Workspace.getList().then((workspaceList) => {
        let newWorkspaceList = workspaceList.map((w) => {
          return {
            workspaceId: w.workspace_id,
            name: w.name,
            isAvailable: w.available,
            isSelected: false
          } as ServerInfo
        });

        let g_ws_target: ServerInfo | null = null;
        for (let i = 0; i < Globals.workspaceList.length; i++) {
          if ( Globals.workspaceList[i].workspaceId == msg.workspaceId ) g_ws_target = Globals.workspaceList[i];
        }
        let new_ws_target: ServerInfo | null = null;
        for (let i = 0; i < newWorkspaceList.length; i++) {
          if ( newWorkspaceList[i].workspaceId == msg.workspaceId ) new_ws_target = newWorkspaceList[i];
        }

        if ( g_ws_target && new_ws_target ) {
          g_ws_target.name = new_ws_target.name;
          g_ws_target.isAvailable = new_ws_target.isAvailable;
          e.reply(IpcId.ToRenderer.FETCH_WORKSPACE_LIST, JSON.stringify(Globals.workspaceList));
        }
      });
    }
  };
  let item_set_icon = {
    label: 'アイコンを設定',
    click: () => {
      showSelectWorkspaceIconModal(e, msg.workspaceId)
    }
  };
  let item_update_workspace_name = {
    label: 'ワークスペース名変更',
    click: () => {
      showUpdateWorkspaceNameModal(e, msg.workspaceId)
    }
  };
  let item_delete_icon = {
    label: 'アイコンを削除',
    click: () => {
      BackendConnector.workspace(msg.workspaceId, (ws) => {
        ws.deleteIcon().then(() => {
          fetchWorkspaceList(e, null as any)
        }).catch((err) => {
          showFooterMessage(e, `アイコンの削除に失敗しました。[${err}}]`);
        });
      })
    }
  };
  let item_delete_workspace = {
    label: 'ワークスペースを削除',
    click: () => {
      showDeleteWorkspaceModal(e, msg.workspaceId)
    }
  };

  if ( msg.is_available ) {
    template.push(item_set_icon)
    template.push(item_update_workspace_name)
  } else {
    template.push(item_reload)
  }
  template.push({ type: 'separator' })
  if ( msg.is_available ) template.push(item_delete_icon)
  template.push(item_delete_workspace)

  const menu = Menu.buildFromTemplate(template)
  let contents: any = BrowserWindow.fromWebContents(e.sender)
  menu.popup(contents)
});

ipcMain.on(IpcId.ToMainProc.DELETE_WORKSPACE, (e, arg) => {
  let msg: ShowContextMenu = JSON.parse(arg)

  BackendConnector.workspace(msg.workspaceId, (ws) => {
    ws.delete().then(() => {
      fetchWorkspaceList(e, null as any)
    }).catch((err) => {
      showFooterMessage(e, `ワークスペースの削除に失敗しました。[${err}}]`);
    });
  })
});

ipcMain.on(IpcId.ToMainProc.FETCH_WORKSPACE_ICON, (e, arg) => {
  let msg: FetchWorkspaceIcon = JSON.parse(arg)

  BackendConnector.workspace(msg.workspaceId, (ws) => {
    ws.fetchIcon().then((imageBase64) => {
      let imageData: IconImageData = {
        workspaceId: msg.workspaceId,
        iconExists: true,
        imageBase64: imageBase64,
      }
      e.reply(IpcId.ToRenderer.FETCH_WORKSPACE_ICON, JSON.stringify(imageData));
    }).catch((err) => {
      if ( 'response' in err ) {
        if ( err.response.status == 404 ) {
          let imageData: IconImageData = {
            workspaceId: msg.workspaceId,
            iconExists: false,
            imageBase64: '',
          }
          e.reply(IpcId.ToRenderer.FETCH_WORKSPACE_ICON, JSON.stringify(imageData));
        } else {
          showFooterMessage(e, `ワークスペースアイコンの取得に失敗しました[${err.response.status}}]`);
        }
      } else {
        showFooterMessage(e, `ワークスペースアイコンの取得に失敗しました[${err}}]`);
      }
    });
  })
});

// selectWorkspaceIdをnullにすると一番上を選択
function fetchWorkspaceList(e: Electron.IpcMainEvent, selectWorkspaceId: string) {
  BackendConnector.Workspace.getList().then((workspaceList) => {
    Globals.workspaceList = workspaceList.map((w) => {
      return {
        workspaceId: w.workspace_id,
        name: w.name,
        isAvailable: w.available,
        isSelected: false
      } as ServerInfo
    });
    if ( Globals.workspaceList.length > 0 ) {
      Globals.workspaceList[0].isSelected = true
    }

    if ( selectWorkspaceId ) {
      selectWorkspace(e, selectWorkspaceId)
    } else {
      replyWorkspaceList(e)
    }

    callChangeCurrentWorkspace(e)
  }).catch((err) => {
    showFooterMessage(e, `ワークスペースリストの取得に失敗しました。[${err}}]`);
  });
}

function replyWorkspaceList(e: Electron.IpcMainEvent) {
  e.reply(IpcId.ToRenderer.FETCH_WORKSPACE_LIST, JSON.stringify(Globals.workspaceList));
}

function selectWorkspace(e: Electron.IpcMainEvent, workspace_id: string) {
  Globals.workspaceList.forEach((w) => {
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
  Globals.workspaceList.forEach((w) => {
    if ( w.isSelected ) {
      changeCurrentWorkspace(e, w.workspaceId, w.name)
    }
  })
}

function showDeleteWorkspaceModal(e: Electron.IpcMainEvent, workspaceId: string) {
  for (let i = 0; i < Globals.workspaceList.length; i++) {
    if ( Globals.workspaceList[i].workspaceId != workspaceId ) continue;

    e.reply(IpcId.ToRenderer.SHOW_DELETE_WORKSPACE_MODAL, JSON.stringify(Globals.workspaceList[i]))
  }
}

function showSelectWorkspaceIconModal(e: Electron.IpcMainEvent, workspaceId: string) {
  for (let i = 0; i < Globals.workspaceList.length; i++) {
    if ( Globals.workspaceList[i].workspaceId != workspaceId ) continue;

    e.reply(IpcId.ToRenderer.SHOW_SET_ICON_MODAL, JSON.stringify(Globals.workspaceList[i]))
  }
}

function showUpdateWorkspaceNameModal(e: Electron.IpcMainEvent, workspaceId: string) {
  for (let i = 0; i < Globals.workspaceList.length; i++) {
    if ( Globals.workspaceList[i].workspaceId != workspaceId ) continue;

    e.reply(IpcId.ToRenderer.SHOW_UPDATE_WORKSPACE_NAME_MODAL, JSON.stringify(Globals.workspaceList[i]))
  }
}
