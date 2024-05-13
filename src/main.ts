import path from 'path'
import { app, BrowserWindow, autoUpdater, Menu, dialog, shell } from 'electron'
import { BackendConnector } from 'uzume-backend-connector'
import { showFooterMessageByBrowserWindow } from './ipc/footer'
import { IpcId as backendSetupIpcId } from './ipc/backendSetup'
import { showBackendConfigModalParam } from './mainProc/backendSetup'
import './mainProc/backendSetup'
import './mainProc/workspaceList'
import './mainProc/images'
import './mainProc/tags'
import './mainProc/tagGroups'
import './mainProc/tagManage'
// ここでimportしないとwebpackがdistにコピーしてくれない
import uzume_icon from './images/uzume-icon-radius.png'

function githubBaseUrlWithVersion() {
  return `https://github.com/Saigo1997/uzume/blob/v${app.getVersion()}`
}

function aboutPanel() {
  const options: Electron.MessageBoxOptions = {
    title: `${app.name}について`,
    message: `${app.name} ${app.getVersion()}`,
    detail: 'Copyright © 2022 amanoiwato',
    icon: path.join(__dirname, uzume_icon),
    buttons: ['閉じる', 'Notice'],
    cancelId: -1, // Escで閉じられたとき
  }

  const selected = dialog.showMessageBoxSync(options)
  if (selected == 1) {
    // Noticeボタンを押したとき
    shell.openExternal(`${githubBaseUrlWithVersion()}/NOTICE`)
  }
}

function openLicense() {
  shell.openExternal(`${githubBaseUrlWithVersion()}/LICENSE`)
}

function openNotice() {
  shell.openExternal(`${githubBaseUrlWithVersion()}/NOTICE`)
}

function createWindow() {
  const options: Electron.BrowserWindowConstructorOptions = {
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  }
  const win = new BrowserWindow(options)
  const isMac = process.platform === 'darwin'
  const template = Menu.buildFromTemplate([
    ...(isMac
      ? ([
          {
            label: app.name,
            submenu: [
              { label: `${app.name}について`, click: aboutPanel },
              {
                label: `アップデートを確認`,
                click: () => {
                  autoUpdater.checkForUpdates()
                },
              },
              { type: 'separator' },
              // {role:'services',   label:'サービス'},
              // {type:'separator'},
              { role: 'hide', label: `${app.name}を隠す` },
              { role: 'hideothers', label: 'ほかを隠す' },
              { role: 'unhide', label: 'すべて表示' },
              { type: 'separator' },
              { role: 'quit', label: `${app.name}を終了` },
            ],
          },
        ] as any)
      : []),
    // {
    //   label: 'ファイル',
    //   submenu: [
    //     isMac ? {role:'close', label:'ウィンドウを閉じる'} : {role:'quit', label:'終了'}
    //   ]
    // },
    {
      label: '編集',
      submenu: [
        { role: 'undo', label: '元に戻す' },
        { role: 'redo', label: 'やり直す' },
        { type: 'separator' },
        { role: 'cut', label: '切り取り' },
        { role: 'copy', label: 'コピー' },
        { role: 'paste', label: '貼り付け' },
        //   ...(isMac ? [
        //       {role:'pasteAndMatchStyle', label:'ペーストしてスタイルを合わせる'},
        //       {role:'delete',    label:'削除'},
        //       {role:'selectAll', label:'すべてを選択'},
        //       {type:'separator' },
        //       {
        //         label: 'スピーチ',
        //         submenu: [
        //           {role:'startSpeaking', label:'読み上げを開始'},
        //           {role:'stopSpeaking',  label:'読み上げを停止'}
        //         ]
        //       }
        //     ] : [
        //       {role:'delete',    label:'削除'},
        //       {type:'separator'},
        //       {role:'selectAll', label:'すべてを選択'}
        //     ])
      ],
    },
    {
      label: '表示',
      submenu: [
        { role: 'reload', label: '再読み込み' },
        //     {role:'forceReload',    label:'強制的に再読み込み'},
        //     {role:'toggleDevTools', label:'開発者ツールを表示'},
        //     {type:'separator'},
        //     {role:'resetZoom',      label:'実際のサイズ'},
        //     {role:'zoomIn',         label:'拡大'},
        //     {role:'zoomOut',        label:'縮小'},
        //     {type:'separator'},
        //     {role:'togglefullscreen', label:'フルスクリーン'}
      ],
    },
    // {
    //   label: 'ウィンドウ',
    //   submenu: [
    //     {role:'minimize', label:'最小化'},
    //     {role:'zoom',     label:'ズーム'},
    //     ...(isMac ? [
    //          {type:'separator'} ,
    //          {role:'front',  label:'ウィンドウを手前に表示'},
    //          {type:'separator'},
    //          {role:'window', label:'ウィンドウ'}
    //        ] : [
    //          {role:'close',  label:'閉じる'}
    //        ])
    //   ]
    // },
    {
      label: 'ワークスペース',
      submenu: [
        {
          label: '接続先サーバー変更',
          click: () => {
            win.webContents.send(backendSetupIpcId.ToRenderer.SHOW_BACKEND_CONFIG_MODAL, showBackendConfigModalParam())
          },
        },
      ],
    },
    {
      label: 'ヘルプ',
      submenu: [
        // { label: `${app.name} ヘルプ` }, // TODO
        // { type: 'separator' },
        { label: `${app.name}について`, click: aboutPanel },
        { type: 'separator' },
        { label: 'LICENSE(ブラウザで開く)', click: openLicense },
        { label: 'NOTICE(ブラウザで開く)', click: openNotice },
      ],
    },
  ])
  Menu.setApplicationMenu(template)

  // 開発時にはデベロッパーツールを開く
  if (process.env.NODE_ENV === 'development' && process.env['E2E_TEST'] != 'true') {
    win.webContents.openDevTools({ mode: 'detach' })
  }

  win.loadFile(path.join(__dirname, 'app.html'))

  BackendConnector.onFailAuthorization = err => {
    showFooterMessageByBrowserWindow(win, `バックエンドに接続できませんでした。[${err}]`)
  }
}

// Electron の初期化が完了したらウィンドウを作成
app.whenReady().then(createWindow)
