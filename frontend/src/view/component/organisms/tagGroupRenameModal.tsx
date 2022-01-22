import React, { useState, useEffect } from 'react';
import ReactModal from "react-modal";
import CssConst from "./../../cssConst";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import {
  IpcId as TagGroupsIpcId,
  TagGroupRenameReply,
  TagGroupRename,
} from '../../../ipc/tagManage';

export const TagGroupRenameModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [tagGroupNameState, setTagGroupNameState] = useState("");
  const [workspaceId, setWorkspaceId] = useState("");
  const [tagGroupId, setTagGroupId] = useState("");

  useEffect(() => {
    window.api.on(TagGroupsIpcId.TO_TAG_GROUP_RENAME_REPLY, (_e, arg) => {
      let tagRenameReply = JSON.parse(arg) as TagGroupRenameReply
      setWorkspaceId(tagRenameReply.workspaceId)
      setTagGroupId(tagRenameReply.tagGroupId)
      setTagGroupNameState(tagRenameReply.tagGroupName)
      setIsOpen(true)
    });
  }, []);

  const onTagGroupNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTagGroupNameState(event.target.value)
  }

  const renameTagGroup = () => {
    let req: TagGroupRename = {
      workspaceId: workspaceId,
      tagGroupId: tagGroupId,
      tagGroupName: tagGroupNameState,
    }
    
    window.api.send(TagGroupsIpcId.TAG_GROUP_RENAME, JSON.stringify(req))
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
        <div className="title">タググループ名変更</div>
        <div className="show-block">
          <input type="text" className="text-box" value={tagGroupNameState} onChange={onTagGroupNameChange}></input>
        </div>
        <div className="form-buttons">
          <button type="submit" className="button" onClick={ () => { setIsOpen(false) } }>キャンセル</button>
          <button type="submit" className="button" onClick={ renameTagGroup }>変更</button>
        </div>
      </form>
    </ReactModal>
  );
}
