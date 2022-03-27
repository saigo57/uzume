import React, { useState, useEffect } from 'react';
import ReactModal from "react-modal";
import CssConst from "./../../cssConst";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import {
  IpcId as AutoUpdateIpcId,
} from '../../../ipc/autoUpdate';

export const AppUpdateModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    window.api.on(AutoUpdateIpcId.SHOW_UPDATE_MODAL_REPLY, (_e, arg) => {
      console.log("AutoUpdateIpcId.SHOW_UPDATE_MODAL_REPLY")
      setIsOpen(true)
    });
  }, []);

  const quitAndInstall = () => {
    window.api.send(AutoUpdateIpcId.QUIT_AND_INSTALL)
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
        <div className="title">アップデートがあります</div>
        <div className="form-buttons">
          <button type="submit" className="button" onClick={ quitAndInstall }>ダウンロード</button>
          <button type="submit" className="button" onClick={ () => { setIsOpen(false) } }>キャンセル</button>
        </div>
      </form>
    </ReactModal>
  );
}
