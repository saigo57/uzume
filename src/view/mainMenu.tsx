import React, { useState, useEffect } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import { workspaceAtom } from './recoil/workspaceAtom'
import { tagGroupListAtom } from './recoil/tagGroupListAtom'
import { MenuMode, menuModeAtom } from './recoil/menuModeAtom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faHome,
  faStar,
  faQuestion,
  faTag,
  faFolder,
  faCaretRight,
  faCaretDown,
} from '@fortawesome/free-solid-svg-icons'
import { useTags, createOnContextMenu } from './lib/tagCustomHooks'
import { ShowContextMenu, TagInfo } from '../ipc/tags'

type MainMenuProps = {
  onAction: (action: string) => void
  onSingleTagClick: (tagId: string) => void
  dsb_ref: React.RefObject<HTMLElement>
}

export const MainMenu: React.FC<MainMenuProps> = props => {
  const workspace = useRecoilValue(workspaceAtom)
  const tagGroupListState = useRecoilValue(tagGroupListAtom)
  const [FavoriteTagListState, setFavoriteTagList] = useState([] as TagInfo[])
  const [tagAllListState, _showingTagAllListState, _resetTagList, _selectingMenu, _selectMenu] = useTags(
    workspace.workspace_id
  )
  const [isTagGroupOpen, setIsTagGroupOpen] = useState({} as { [key: string]: boolean })
  const [currMode, _] = useRecoilState(menuModeAtom)

  useEffect(() => {
    setIsTagGroupOpen({})
  }, [tagGroupListState])

  useEffect(() => {
    setFavoriteTagList(tagAllListState.filter(tag => tag.favorite))
  }, [tagAllListState])

  const onHomeClick = () => {
    if (props.onAction) props.onAction('home_click')
  }

  const onUncategorizedClick = () => {
    if (props.onAction) props.onAction('uncategorized_click')
  }

  const onTagManageClick = () => {
    if (props.onAction) props.onAction('tag_manage_click')
  }

  const selectedClass = (menu: string): string => {
    return currMode == menu ? 'selected' : ''
  }

  const onTagGroupClick = (tagGroupId: string) => {
    setIsTagGroupOpen(state => {
      const next_state = { ...state }
      next_state[tagGroupId] = !next_state[tagGroupId]
      return next_state
    })
  }

  const tagInfoToShowContextMenu = (tagInfo: TagInfo) => {
    return {
      workspaceId: workspace.workspace_id,
      tagId: tagInfo.tagId,
      tagName: tagInfo.name,
      currFavorite: tagInfo.favorite,
    } as ShowContextMenu
  }

  return (
    <section id="main-menu" className="main-menu" ref={props.dsb_ref}>
      <h1 className="menu-title">{workspace.workspace_name}</h1>
      <h1 className={`menu-title clickable ${selectedClass(MenuMode.HOME)}`} onClick={onHomeClick}>
        <FontAwesomeIcon icon={faHome} />
        <div className="menu-title-text">Home</div>
      </h1>
      <h1 className={`menu-title clickable ${selectedClass(MenuMode.UNCATEGORIZED)}`} onClick={onUncategorizedClick}>
        <FontAwesomeIcon icon={faQuestion} />
        <div className="menu-title-text">未分類</div>
      </h1>
      <h1 className={`menu-title clickable ${selectedClass(MenuMode.TAG_MANAGE)}`} onClick={onTagManageClick}>
        <FontAwesomeIcon icon={faTag} />
        <div className="menu-title-text">タグ管理</div>
      </h1>
      <h1 className="menu-title">
        <FontAwesomeIcon icon={faStar} />
        <div className="menu-title-text">お気に入りタグ</div>
      </h1>
      <ul>
        {FavoriteTagListState.map(tag => {
          return (
            <li
              className="tag-item"
              onClick={() => {
                props.onSingleTagClick(tag.tagId)
              }}
              onContextMenu={createOnContextMenu(tagInfoToShowContextMenu(tag))}
            >
              <FontAwesomeIcon icon={faTag} />
              {tag.name}
            </li>
          )
        })}
      </ul>
      <h1 className="menu-title">
        <FontAwesomeIcon icon={faFolder} />
        <div className="menu-title-text">タググループ</div>
      </h1>
      <ul>
        {tagGroupListState.map(tag_group => {
          return (
            <>
              <li
                className="tag-group-item"
                onClick={() => {
                  onTagGroupClick(tag_group.tagGroupId)
                }}
              >
                <FontAwesomeIcon icon={isTagGroupOpen[tag_group.tagGroupId] ? faCaretDown : faCaretRight} />
                {tag_group.name}
              </li>
              {(() => {
                // タグ
                if (isTagGroupOpen[tag_group.tagGroupId]) {
                  return tagAllListState.map(tag => {
                    if (tag.tagGroupId != tag_group.tagGroupId) return
                    return (
                      <li
                        className="tag-item"
                        onClick={() => {
                          props.onSingleTagClick(tag.tagId)
                        }}
                        onContextMenu={createOnContextMenu(tagInfoToShowContextMenu(tag))}
                      >
                        <FontAwesomeIcon icon={faTag} />
                        {tag.name}
                      </li>
                    )
                  })
                }
              })()}
            </>
          )
        })}
      </ul>
    </section>
  )
}
