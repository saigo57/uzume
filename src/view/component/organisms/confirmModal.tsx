import React from 'react'
import ReactModal from 'react-modal'
import CssConst from './../../cssConst'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'

type ConfirmModalProps = {
  display: boolean
  message: string
  onClose: () => void
}

export const ConfirmModal: React.VFC<ConfirmModalProps> = props => {
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
      wordBreak: 'break-word',
    },
    overlay: {
      background: 'rgba(0, 0, 0, 0.5)',
    },
  }

  return (
    <ReactModal isOpen={props.display} onRequestClose={props.onClose} style={reactModalStyle} ariaHideApp={false}>
      <form className="modal-form" onSubmit={props.onClose}>
        <FontAwesomeIcon icon={faTimes} className="close-button" onClick={props.onClose} />
        <div className="title">確認</div>
        <div className="content">{props.message}</div>
        <div className="form-buttons">
          <button type="submit" className="button" onClick={props.onClose}>
            OK
          </button>
        </div>
      </form>
    </ReactModal>
  )
}
