import React, { useState, useEffect, useRef } from 'react'
import { useRecoilState, useSetRecoilState } from 'recoil'
import { tagListAtom } from '../recoil/tagListAtom'
import { tagGroupListAtom } from './../recoil/tagGroupListAtom'
import ReactModal from 'react-modal'
import { useDrop } from 'react-dnd'
import { useDraggableSplitBar } from '../lib/draggableSplitBarHooks'
import { MenuItem, useTags } from '../lib/tagCustomHooks'
import { Tag } from './../component/atmos/tag'
import { IpcId as TagIpcId, GetAllTags, TagList } from '../../ipc/tags'
import {
  IpcId as TagGroupsIpcId,
  CreateTagGroup,
  AddToTagGroup,
  TagGroupList,
  GetAllTagGroups,
} from '../../ipc/tagGroups'
import { IpcId as TagManageIpcId, TagGroupContextMenu } from '../../ipc/tagManage'
import CssConst from './../cssConst'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faTimes } from '@fortawesome/free-solid-svg-icons'

type TagGroupMenuProps = {
  workspaceId: string
  tagGroupId: string
  name: string
  isSelected: boolean
  onMenuClick: (menu: string) => void
}

type TagManageProps = {
  workspaceId: string
  dsb_ref: React.RefObject<HTMLDivElement>
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

const TagGroupMenu: React.VFC<TagGroupMenuProps> = props => {
  const setTagAllList = useSetRecoilState(tagListAtom)
  const onDrop = (item: any) => {
    const req = {
      workspaceId: props.workspaceId,
      tagGroupId: props.tagGroupId,
      tagId: item.tagId,
    } as AddToTagGroup

    window.api.invoke(TagGroupsIpcId.Invoke.ADD_TO_TAG_GROUP, JSON.stringify(req)).then(() => {
      const req = {
        workspaceId: props.workspaceId,
      } as GetAllTags
      window.api.invoke(TagIpcId.Invoke.GET_ALL_TAGS, JSON.stringify(req)).then(arg => {
        const tagList = JSON.parse(arg) as TagList
        setTagAllList(tagList.tags)
      })
    })
  }

  const [{ isOver }, dropRef] = useDrop({
    accept: 'Item',
    drop: onDrop,
    collect: monitor => ({
      isOver: monitor.isOver(),
    }),
  })

  const showContextMenu = () => {
    const req = {
      workspaceId: props.workspaceId,
      tagGroupId: props.tagGroupId,
      tagGroupName: props.name,
    } as TagGroupContextMenu
    window.api.send(TagManageIpcId.TagGroupContextMenu.SHOW_CONTEXT_MENU, JSON.stringify(req))
  }

  return (
    <div
      className={`menu-item ${isOver ? 'drop-over' : ''} ${props.isSelected ? 'selected' : ''}`}
      ref={dropRef}
      onClick={() => props.onMenuClick(props.tagGroupId)}
      onContextMenu={() => showContextMenu()}
    >
      {`${props.name}`}
    </div>
  )
}

export const TagManage: React.VFC<TagManageProps> = props => {
  const setTagAllList = useSetRecoilState(tagListAtom)
  const [tagGroupListState, setTagGroupList] = useRecoilState(tagGroupListAtom)
  const [newTagGroupNameState, setNewTagGroupName] = useState('')
  const [isShowNewTagGroupModalState, setIsShowNewTagGroupModal] = useState(false)
  const [_tagAllListState, showingTagAllListState, resetTagList, selectingMenu, selectMenu] = useTags(props.workspaceId)

  useEffect(() => {
    resetTagList()
  }, [props.workspaceId])

  useEffect(() => {
    window.api.on(TagManageIpcId.TagGroupContextMenu.TAG_GROUP_DELETED, (_e, _arg) => {
      selectMenu(MenuItem.ALL_TAG)

      const tagGroupReq = {
        workspaceId: props.workspaceId,
      } as GetAllTagGroups

      window.api.invoke(TagGroupsIpcId.Invoke.GET_ALL_TAG_GROUPS, JSON.stringify(tagGroupReq)).then((arg: string) => {
        const tagGroupList = JSON.parse(arg) as TagGroupList
        setTagGroupList(tagGroupList.tag_groups)
      })

      const tagReq = {
        workspaceId: props.workspaceId,
      } as GetAllTags

      window.api.invoke(TagIpcId.Invoke.GET_ALL_TAGS, JSON.stringify(tagReq)).then(arg => {
        const tagList = JSON.parse(arg) as TagList
        setTagAllList(tagList.tags)
      })
    })
  }, [])

  const onTagGroupPlusClick = () => {
    setNewTagGroupName('')
    setIsShowNewTagGroupModal(true)
  }

  const tagGroupNameOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewTagGroupName(event.target.value)
  }

  const createTagGroup = () => {
    const req = {
      workspaceId: props.workspaceId,
      name: newTagGroupNameState,
    } as CreateTagGroup

    window.api.invoke(TagGroupsIpcId.Invoke.CREATE_NEW_TAG_GROUP, JSON.stringify(req)).then(() => {
      window.api.invoke(TagGroupsIpcId.Invoke.GET_ALL_TAG_GROUPS, JSON.stringify(req)).then((arg: string) => {
        const tagGroupList = JSON.parse(arg) as TagGroupList
        setTagGroupList(tagGroupList.tag_groups)
      })
    })
  }

  const menuSelected = (menu: string): string => {
    return selectingMenu == menu ? 'selected' : ''
  }

  const onMenuClick = (menu: string) => {
    selectMenu(menu)
  }

  const dsb_split_bar = useRef<HTMLDivElement>(null)
  const dsb_right = useRef<HTMLDivElement>(null)
  useDraggableSplitBar(props.dsb_ref, dsb_split_bar, dsb_right)

  return (
    <>
      <section id="tag-manage-menu-area" className="tag-manage-menu-area" ref={props.dsb_ref}>
        <div className={`menu-item ${menuSelected(MenuItem.ALL_TAG)}`} onClick={() => onMenuClick(MenuItem.ALL_TAG)}>
          すべてのタグ
        </div>
        <div
          className={`menu-item ${menuSelected(MenuItem.UNCATEGORIZED_TAG)}`}
          onClick={() => onMenuClick(MenuItem.UNCATEGORIZED_TAG)}
        >
          未分類のタグ
        </div>
        <div className="menu-title">
          タググループ
          <FontAwesomeIcon icon={faPlus} onClick={onTagGroupPlusClick} />
        </div>
        {tagGroupListState.map(tg => {
          return (
            <TagGroupMenu
              workspaceId={props.workspaceId}
              name={tg.name}
              tagGroupId={tg.tagGroupId}
              isSelected={selectingMenu == tg.tagGroupId}
              onMenuClick={onMenuClick}
            />
          )
        })}
      </section>

      <div id="tag-manage-area-split-bar" className="split-bar" ref={dsb_split_bar}></div>

      <section id="tag-manage-list-area" className="tag-manage-list-area" ref={dsb_right}>
        {showingTagAllListState.map(t => {
          return (
            <Tag
              workspaceId={props.workspaceId}
              tagId={t.tagId}
              tagName={t.name}
              favorite={t.favorite}
              delete={false}
              alreadyAdded={false}
              onClick={null}
              onDeleteClick={null}
            />
          )
        })}
      </section>

      <ReactModal
        isOpen={isShowNewTagGroupModalState}
        onRequestClose={() => {
          setIsShowNewTagGroupModal(false)
        }}
        style={reactModalStyle}
      >
        <form
          className="modal-form"
          onSubmit={() => {
            setIsShowNewTagGroupModal(false)
          }}
        >
          <FontAwesomeIcon
            icon={faTimes}
            className="close-button"
            onClick={() => {
              setIsShowNewTagGroupModal(false)
            }}
          />
          <div className="title">タググループ新規作成</div>
          <div className="show-block">
            <label className="label-name">タググループ名</label>
            <input
              type="text"
              className="text-box"
              value={newTagGroupNameState}
              onChange={tagGroupNameOnChange}
            ></input>
          </div>
          <div className="form-buttons">
            <button
              type="submit"
              className="button"
              onClick={() => {
                setIsShowNewTagGroupModal(false)
              }}
            >
              キャンセル
            </button>
            <button type="submit" className="button" onClick={createTagGroup}>
              作成
            </button>
          </div>
        </form>
      </ReactModal>
    </>
  )
}
