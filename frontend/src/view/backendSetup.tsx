import React from 'react';
import {
  IpcId as WindowModeIpcId,
  BackendState,
} from "../ipc/windowMode";
import CssConst from "./cssConst";

type BackendSetupProps = {
  backendState: BackendState
};

export const BackendSetup:React.VFC<BackendSetupProps> = (props) => {
  const backendInstall = () => {
    window.api.send(WindowModeIpcId.BACKEND_INSTALL);
  }

  const frontEndReload = () => {
    window.api.send(WindowModeIpcId.BACKEND_RELOAD);
  }

  const openAppDir = () => {
    window.api.send(WindowModeIpcId.OPEN_BACKEND_APP_DIR);
  }

  const setupStyle: React.CSSProperties = {
    color: CssConst.MAIN_FONT_COLOR,
    backgroundColor: CssConst.LIGHT_BACKGROUND_COLOR,
    margin: '100px auto auto auto',
    padding: '15px',
    width: '80%',
  }

  const linkStyle: React.CSSProperties = {
    textDecoration: 'underline',
    cursor: 'pointer',
  }

  return (
    <div style={setupStyle}>
      <h1 style={{fontSize: '20px'}}>uzumeServerに接続できませんでした。</h1>
      <div style={{margin: '10px 0', lineHeight: '1.2em'}}>
        <div>現在の接続先: {props.backendState.host}:{props.backendState.port}</div>
        {(() => {
          if ( props.backendState.installed ) {
            return <div><a onClick={openAppDir} style={linkStyle} >インストールフォルダ</a>からuzumeServerを起動して、下のリロードを行ってください</div>
          } else {
            return (
              <>
                <p>uzumeServerがインストールされていません。</p>
                <p>下のインストールボタンからインストールを行ってください。</p>
                <p>※{props.backendState.defaultInstallDir}以外にインストールしている場合はuzumeServerを起動してからリロードを行ってください。</p>
              </>
            )
          }
        })()}
      </div>

      {(() => {
        if ( !props.backendState.installed ) {
          return <button onClick={backendInstall}>インストール</button>
        }
      })()}
      <button>接続先を変更(未実装)</button>
      <button onClick={frontEndReload}>リロード</button>
    </div>
  )
}
