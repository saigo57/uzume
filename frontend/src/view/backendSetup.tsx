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
  const backendDownload = () => {
    window.api.send(WindowModeIpcId.BACKEND_DOWNLOAD);
  }

  const frontEndReload = () => {
    window.api.send(WindowModeIpcId.BACKEND_RELOAD);
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
      <h1 style={{fontSize: '20px'}}>uzume-serverに接続できませんでした。</h1>
      <div style={{margin: '10px 0', lineHeight: '1.2em'}}>
        <div>現在の接続先: {props.backendState.host}:{props.backendState.port}</div>
        <div>uzume-serverを起動して、下のボタンからリロードを行ってください。</div>
        <div>まだインストールしていない場合は、インストーラーをダウンロードして、インストールしてください。</div>
      </div>

      <button onClick={backendDownload}>インストーラーをダウンロード</button>
      <button>接続先を変更(未実装)</button>
      <button onClick={frontEndReload}>リロード</button>
    </div>
  )
}
