import React, { useState, useEffect } from 'react'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import { workspaceIdAtom } from '../../recoil/workspaceAtom'
import { imageInfoListAtom } from '../../recoil/imageListAtom'
import { tagListAtom } from '../../recoil/tagListAtom'
import { tagGroupListAtom } from '../../recoil/tagGroupListAtom'
import { MenuItem, useTags } from '../../lib/tagCustomHooks'
import { Tag } from '../atmos/tag'
import {
  IpcId as TagsIpcId,
  TagInfo,
  CreateTagToImage,
  GetAllTags,
  TagList,
  CreatedTagToImage,
} from '../../../ipc/tags'
import { IpcId as ImagesIpcId, ImageInfo, AddTagToImage } from '../../../ipc/images'
import CssConst from './../../cssConst'

import './tagGroupMenu.scss'

type TagCtrlPanelProps = {
  display: boolean
  imageIds: string[]
  alreadyLinkedTag: TagInfo[]
  onClose: () => void
  onRemoveTag: ((tagId: string) => void) | null
}

export const TagCtrlPanel: React.VFC<TagCtrlPanelProps> = props => {
  const workspaceId = useRecoilValue(workspaceIdAtom)
  const setTagAllList = useSetRecoilState(tagListAtom)
  const tagGroupListState = useRecoilValue(tagGroupListAtom)
  const [searchTagText, setSearchTagText] = useState('')
  const [_tagAllListState, showingTagAllListState, _resetTagList, selectingMenu, selectMenu] = useTags(workspaceId)
  const [_imageInfoList, setImageInfoList] = useRecoilState(imageInfoListAtom)

  useEffect(() => {
    if (!props.display) setSearchTagText('')
  }, [props.display])

  const onSearchTagTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTagText(e.target.value)
  }

  const createNewTag = (tagName: string) => {
    if (props.imageIds.length == 0) return
    if (tagName.length == 0) return

    const req: CreateTagToImage = {
      workspaceId: workspaceId,
      imageIds: props.imageIds,
      tagName: tagName,
    }

    window.api.invoke(TagsIpcId.Invoke.CREATE_NEW_TAG_TO_IMAGE, JSON.stringify(req)).then((createdTagStr: string) => {
      // タグ再取得
      const reqTags = {
        workspaceId: workspaceId,
      } as GetAllTags

      window.api.invoke(TagsIpcId.Invoke.GET_ALL_TAGS, JSON.stringify(reqTags)).then(arg => {
        const tagList = JSON.parse(arg) as TagList
        setTagAllList(tagList.tags)
      })

      // 画像にタグ付与
      const createdTag = JSON.parse(createdTagStr) as CreatedTagToImage

      const reqAddTag: AddTagToImage = {
        workspaceId: createdTag.createTag.workspaceId,
        imageIds: createdTag.createTag.imageIds,
        tagId: createdTag.createdTagInfo.tagId,
      }

      window.api.invoke(ImagesIpcId.Invoke.ADD_TAG, JSON.stringify(reqAddTag)).then(arg => {
        const imageInfoList = JSON.parse(arg) as ImageInfo[]
        setImageInfoList(imageInfoList)
      })
    })

    setSearchTagText('')
  }

  const addTagToImage = (tagId: string) => {
    const req: AddTagToImage = {
      workspaceId: workspaceId,
      imageIds: props.imageIds,
      tagId: tagId,
    }
    window.api.invoke(ImagesIpcId.Invoke.ADD_TAG, JSON.stringify(req)).then(arg => {
      const imageInfoList = JSON.parse(arg) as ImageInfo[]
      setImageInfoList(imageInfoList)
    })
  }

  const alreadyLinkedTagId = props.alreadyLinkedTag.map(t => t.tagId)

  const style: React.CSSProperties = {
    position: 'absolute',
    display: props.display ? 'block' : 'none',
    top: '200px',
    right: '15px',
    height: '300px',
    width: '500px',
    border: `1px solid ${CssConst.EDGE_GRAY}`,
    borderRadius: '5px',
    backgroundColor: CssConst.MAIN_BACKGROUND_COLOR,
    zIndex: 100,
  }

  const tagGroupAreaWidth = '150px'

  const inputStyle: React.CSSProperties = {
    width: '250px',
    height: '18px',
    marginTop: `5px`,
    marginBottom: `5px`,
    marginLeft: `5px`,
    borderRadius: '2px',
    backgroundColor: CssConst.VERY_LIGHT_BACKGROUND_COLOR,
    border: `1px solid white`,
    color: CssConst.MAIN_FONT_COLOR,
  }

  const tagGroupAreaStyle: React.CSSProperties = {
    float: 'left',
    width: `${tagGroupAreaWidth}`,
    height: '100%',
    overflowY: 'scroll',
  }

  const tagAreaStyle: React.CSSProperties = {
    float: 'right',
    width: `calc(100% - ${tagGroupAreaWidth})`,
    height: 'calc(100% - 35px)',
    overflowY: 'scroll',
  }

  const menuSelected = (menu: string): string => {
    return selectingMenu == menu ? 'selected' : ''
  }

  const onMenuClick = (menu: string) => {
    selectMenu(menu)
  }

  return (
    <div style={style}>
      <input
        style={inputStyle}
        type="text"
        name="tag-search"
        value={searchTagText}
        placeholder={'検索 or 新規作成'}
        onChange={onSearchTagTextChange}
      />

      <div className="tag-ctrl-panel" style={tagGroupAreaStyle}>
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

      <div style={tagAreaStyle}>
        <div id="tag-ctrl-panel-tagsarea-id">
          {(() => {
            // 入力したタグ名が登録されていないとき、新規追加UIを表示する
            if (!showingTagAllListState.map(t => t.name).includes(searchTagText)) {
              return (
                <div>
                  <Tag
                    tagId={null}
                    tagName={`追加:${searchTagText}`}
                    favorite={false}
                    delete={false}
                    alreadyAdded={false}
                    onClick={() => {
                      createNewTag(searchTagText)
                    }}
                    onDeleteClick={null}
                  />
                </div>
              )
            }
          })()}

          {showingTagAllListState.map(t => {
            if (searchTagText.length == 0 || t.name.indexOf(searchTagText) != -1) {
              return (
                <Tag
                  tagId={t.tagId}
                  tagName={t.name}
                  favorite={t.favorite}
                  delete={false}
                  alreadyAdded={alreadyLinkedTagId.includes(t.tagId)}
                  onClick={() => {
                    addTagToImage(t.tagId)
                  }}
                  onDeleteClick={props.onRemoveTag}
                />
              )
            }
          })}
        </div>
      </div>
    </div>
  )
}
