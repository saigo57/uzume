import React, { useState, useEffect } from 'react';
import {
  IpcId as FooterListIpcId,
  FooterMessage,
} from "../ipc/footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import CssConst from "./cssConst";

export function Footer() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    window.api.on(FooterListIpcId.ToRenderer.FOOTER_MESSAGE_REPLY, (_e, arg) => {
      const footerMessage = JSON.parse(arg) as FooterMessage
      setMessage(footerMessage.message);
    });
  }, []);

  const messageStyle: React.CSSProperties = {
    marginLeft: '10px',
    marginTop: '2px',
    fontSize: '14px',
    color: CssConst.MAIN_FONT_COLOR,
    userSelect: 'none',
  }

  const resetIconStyle: React.CSSProperties = {
    width: '8px',
    marginRight: '4px',
  }

  return (
    <section id="footer">
      <div style={messageStyle}>
        {
          (() => {
            if ( message == '' ) return;
            return (
              <>
                <FontAwesomeIcon icon={faTimes} style={resetIconStyle} onClick={ () => { setMessage("") } } />{message}
              </>
            );
          })()
        }
      </div>
    </section>
  );
}
