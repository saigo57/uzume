import React, { useState, useEffect } from 'react';
import ReactModal from "react-modal";
import CssConst from "./../../cssConst";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import {
  IpcId as BackendSetupIpcId,
  BackendUrlHost,
} from '../../../ipc/backendSetup';

export const BackendConfigModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hostNameState, setHostNameState] = useState("");
  const [portState, setPortState] = useState("");

  useEffect(() => {
    window.api.on(BackendSetupIpcId.SHOW_BACKEND_CONFIG_MODAL_REPLY, (_e, arg) => {
      let backendUrlHost = JSON.parse(arg) as BackendUrlHost
      setHostNameState(backendUrlHost.host)
      setPortState(backendUrlHost.port)
      setIsOpen(true)
    });
  }, []);

  const updateBackendUrlHost = () => {
    var backendUrlHost = {
      host: hostNameState,
      port: portState,
    } as BackendUrlHost
    window.api.send(BackendSetupIpcId.UPDATE_BACKEND_URL_HOST, JSON.stringify(backendUrlHost))
  }

  const onHostNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setHostNameState(event.target.value)
  }

  const onPortChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPortState(event.target.value)
  }

  const reactModalStyle: ReactModal.Styles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: CssConst.MAIN_BACKGROUND_COLOR,
      borderColor: CssConst.EDGE_GRAY,
      color: CssConst.MAIN_FONT_COLOR,
    },
    overlay: {
      background: 'rgba(0, 0, 0, 0.5)'
    }
  }

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={ () => { setIsOpen(false) } }
      style={reactModalStyle}
      ariaHideApp={false}
    >
      <form className="modal-form" onSubmit={ ()=>{setIsOpen(false)} }>
        <FontAwesomeIcon icon={faTimes} className="close-button" onClick={ () => { setIsOpen(false) } } />
        <div className="title">接続先設定</div>
        <div className="show-block">
          <label className="label-name">host</label>
          <input type="text" className="text-box" value={hostNameState} onChange={onHostNameChange}></input>
        </div>
        <div className="show-block">
          <label className="label-name">port</label>
          <input type="text" className="text-box" value={portState} onChange={onPortChange}></input>
        </div>
        <div className="form-buttons">
          <button type="submit" className="button" onClick={updateBackendUrlHost}>接続</button>
          <button type="submit" className="button" onClick={ () => { setIsOpen(false) } }>キャンセル</button>
        </div>
      </form>
    </ReactModal>
  );
}
