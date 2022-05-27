import React, { useState, useEffect } from 'react'
import { Tag } from '../atmos/tag'
import { MenuItem, useTags } from '../../lib/tagCustomHooks'
import CssConst from './../../cssConst'
import { TagInfo } from '../../../ipc/tags'

import './tagGroupMenu.scss'

type SearchPanelProps = {
  id: string
  display: boolean
  workspaceId: string
  selectedTag: TagInfo[]
  onTagAddClick: (tagId: string | null, tagName: string) => void
  onTagDeleteClick: (tagId: string) => void
}

export const SearchPanel: React.VFC<SearchPanelProps> = props => {
  const [searchTagText, setSearchTagText] = useState('')
  const [tagGroupListState, _tagAllListState, showingTagAllListState, resetTagList, selectingMenu, selectMenu] =
    useTags(props.workspaceId)

  useEffect(() => {
    resetTagList()
  }, [props.workspaceId])

  const selectedTagIds = props.selectedTag.map(t => t.tagId)

  const style: React.CSSProperties = {
    position: 'absolute',
    display: props.display ? 'block' : 'none',
    top: '37px',
    height: '300px',
    width: '500px',
    backgroundColor: CssConst.MAIN_BACKGROUND_COLOR,
    border: `1px solid ${CssConst.EDGE_GRAY}`,
    zIndex: 10,
  }

  const tagGroupAreaWidth = '150px'

  const tagGroupArea: React.CSSProperties = {
    float: 'left',
    width: `${tagGroupAreaWidth}`,
    height: '100%',
    overflowY: 'scroll',
  }

  const tagSearchArea: React.CSSProperties = {
    float: 'right',
    width: `calc(100% - ${tagGroupAreaWidth})`,
    height: '100%',
  }

  const inputHeight = '18px'
  const inputMarginTopBot = '5px'
  const inputStyle: React.CSSProperties = {
    width: 'calc(100% - 30px)',
    height: inputHeight,
    marginTop: inputMarginTopBot,
    marginBottom: inputMarginTopBot,
    marginLeft: `5px`,
    borderRadius: '2px',
    backgroundColor: CssConst.VERY_LIGHT_BACKGROUND_COLOR,
    border: `1px solid white`,
    color: CssConst.MAIN_FONT_COLOR,
  }

  const tagsArea: React.CSSProperties = {
    width: '100%',
    height: `calc(100% - ${inputHeight} - ${inputMarginTopBot} * 2 - 4px)`,
    marginTop: 0,
    marginBottom: 0,
    overflowY: 'scroll',
  }

  const menuSelected = (menu: string): string => {
    return selectingMenu == menu ? 'selected' : ''
  }

  const onMenuClick = (menu: string) => {
    selectMenu(menu)
  }

  const onSearchTagTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTagText(e.target.value)
  }

  return (
    <div id={props.id} className="search-panel" style={style}>
      <div style={tagGroupArea}>
        <div className={`menu-item ${menuSelected(MenuItem.ALL_TAG)}`} onClick={() => onMenuClick(MenuItem.ALL_TAG)}>
          すべてのタグ
        </div>
        <div
          className={`menu-item ${menuSelected(MenuItem.UNCATEGORIZED_TAG)}`}
          onClick={() => onMenuClick(MenuItem.UNCATEGORIZED_TAG)}
        >
          未分類のタグ
        </div>
        {tagGroupListState.map((tg: any) => {
          return (
            <div className={`menu-item ${menuSelected(tg.tagGroupId)}`} onClick={() => onMenuClick(tg.tagGroupId)}>
              {tg.name}
            </div>
          )
        })}
      </div>

      <div style={tagSearchArea}>
        <input
          style={inputStyle}
          type="text"
          name="tag-search"
          value={searchTagText}
          placeholder={'検索'}
          onChange={onSearchTagTextChange}
        />

        <div style={tagsArea}>
          {showingTagAllListState.map((t: any) => {
            if (searchTagText.length == 0 || t.name.indexOf(searchTagText) != -1) {
              return (
                <Tag
                  workspaceId={props.workspaceId}
                  tagId={t.tagId}
                  tagName={t.name}
                  favorite={t.favorite}
                  delete={false}
                  alreadyAdded={selectedTagIds.includes(t.tagId)}
                  onClick={props.onTagAddClick}
                  onDeleteClick={props.onTagDeleteClick}
                />
              )
            }
          })}
        </div>
      </div>
    </div>
  )
}
