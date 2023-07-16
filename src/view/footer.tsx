import React, { useState, useEffect } from 'react'
import { useRecoilValue } from 'recoil'
import { imageQueueAtom } from './recoil/imageQueueAtom'
import { IpcId as FooterListIpcId, FooterMessage } from '../ipc/footer'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import CssConst from './cssConst'

export function Footer() {
  const [message, setMessage] = useState('')
  const imageQueue = useRecoilValue(imageQueueAtom)

  useEffect(() => {
    window.api.on(FooterListIpcId.ToRenderer.FOOTER_MESSAGE_REPLY, (_e, arg) => {
      const footerMessage = JSON.parse(arg) as FooterMessage
      setMessage(footerMessage.message)
    })
  }, [])

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-start',
  }

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

  const imageQueueCountStyle: React.CSSProperties = {
    marginLeft: 'auto',
    marginRight: '10px',
    marginTop: '2px',
    fontSize: '14px',
    color: CssConst.MAIN_FONT_COLOR,
    userSelect: 'none',
  }

  return (
    <section id="footer" style={containerStyle}>
      <div style={messageStyle}>
        {(() => {
          if (message == '') return
          return (
            <>
              <FontAwesomeIcon
                icon={faTimes}
                style={resetIconStyle}
                onClick={() => {
                  setMessage('')
                }}
              />
              {message}
            </>
          )
        })()}
      </div>
      <div style={imageQueueCountStyle}>imageQueue: {imageQueue.length}</div>
    </section>
  )
}
