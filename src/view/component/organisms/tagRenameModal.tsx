import React, { useState, useEffect } from 'react'
import { useSetRecoilState } from 'recoil'
import { tagListAtom } from '../../recoil/tagListAtom'
import ReactModal from 'react-modal'
import CssConst from './../../cssConst'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { IpcId as TagsIpcId, TagRenameReply, TagRename, GetAllTags, TagList } from '../../../ipc/tags'

export const TagRenameModal = () => {
  const setTagAllList = useSetRecoilState(tagListAtom)
  const [isOpen, setIsOpen] = useState(false)
  const [tagNameState, setTagNameState] = useState('')
  const [workspaceId, setWorkspaceId] = useState('')
  const [tagId, setTagId] = useState('')

  useEffect(() => {
    window.api.on(TagsIpcId.TagContextMenu.SHOW_TAG_RENAME_MODAL, (_e, arg) => {
      const tagRenameReply = JSON.parse(arg) as TagRenameReply
      setWorkspaceId(tagRenameReply.workspaceId)
      setTagId(tagRenameReply.tagId)
      setTagNameState(tagRenameReply.tagName)
      setIsOpen(true)
    })
  }, [])

  const onTagNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTagNameState(event.target.value)
  }

  const renameTag = () => {
    const req: TagRename = {
      workspaceId: workspaceId,
      tagId: tagId,
      tagName: tagNameState,
    }

    window.api.invoke(TagsIpcId.Invoke.TAG_RENAME, JSON.stringify(req)).then(() => {
      if (workspaceId == '') return
      const req = {
        workspaceId: workspaceId,
      } as GetAllTags
      window.api.invoke(TagsIpcId.Invoke.GET_ALL_TAGS, JSON.stringify(req)).then(arg => {
        const tagList = JSON.parse(arg) as TagList
        setTagAllList(tagList.tags)
      })
    })
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
      background: 'rgba(0, 0, 0, 0.5)',
    },
  }

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={() => {
        setIsOpen(false)
      }}
      style={reactModalStyle}
      ariaHideApp={false}
    >
      <form
        className="modal-form"
        onSubmit={() => {
          setIsOpen(false)
        }}
      >
        <FontAwesomeIcon
          icon={faTimes}
          className="close-button"
          onClick={() => {
            setIsOpen(false)
          }}
        />
        <div className="title">タグ名変更</div>
        <div className="show-block">
          <input type="text" className="text-box" value={tagNameState} onChange={onTagNameChange}></input>
        </div>
        <div className="form-buttons">
          <button
            type="submit"
            className="button"
            onClick={() => {
              setIsOpen(false)
            }}
          >
            キャンセル
          </button>
          <button type="submit" className="button" onClick={renameTag}>
            変更
          </button>
        </div>
      </form>
    </ReactModal>
  )
}
