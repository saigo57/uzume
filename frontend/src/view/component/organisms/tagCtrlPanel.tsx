import React, { useState, useEffect} from 'react';
import { MenuItem, useTags } from '../../lib/tagCustomHooks';
import { Tag } from "../atmos/tag";
import {
  IpcId as TagsIpcId,
  TagInfo,
  CreateTagToImage,
} from '../../../ipc/tags'
import {
  IpcId as ImagesIpcId,
  AddTagToImage,
} from '../../../ipc/images'
import CssConst from "./../../cssConst";

import './tagGroupMenu.scss';

type TagCtrlPanelProps = {
  display: boolean
  workspaceId: string
  imageIds: string[]
  alreadyLinkedTag: TagInfo[]
  onClose: ()=>void
  onRemoveTag: ((tagId: string) => void) | null
}

export const TagCtrlPanel:React.VFC<TagCtrlPanelProps> = (props) => {
  const [searchTagText, setSearchTagText] = useState('');
  const [tagGroupListState, _tagAllListState, showingTagAllListState, _resetTagList, selectingMenu, selectMenu] = useTags(props.workspaceId);

  useEffect(() => {
    if ( !props.display ) setSearchTagText('');
  }, [props.display]);

  const onSearchTagTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTagText(e.target.value)
  };

  const createNewTag = (tagName: string) => {
    if ( props.imageIds.length == 0 ) return;
    if ( tagName.length == 0 ) return;

    let req: CreateTagToImage = {
      workspaceId: props.workspaceId,
      imageIds: props.imageIds,
      tagName: tagName,
    }
    window.api.send(TagsIpcId.CREATE_NEW_TAG_TO_IMAGE, JSON.stringify(req));
    setSearchTagText('')
  };

  const addTagToImage = (tagId: string) => {
    let req: AddTagToImage = {
      workspaceId: props.workspaceId,
      imageIds: props.imageIds,
      tagId: tagId,
    }
    window.api.send(ImagesIpcId.ADD_TAG, JSON.stringify(req));
  }

  let alreadyLinkedTagId = props.alreadyLinkedTag.map(t => t.tagId);

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

  const tagGroupAreaWidth = '150px';

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
  };

  const tagGroupAreaStyle: React.CSSProperties = {
    float: 'left',
    width: `${tagGroupAreaWidth}`,
    height: '100%',
    overflowY: 'scroll',
  };

  const tagAreaStyle: React.CSSProperties = {
    float: 'right',
    width: `calc(100% - ${tagGroupAreaWidth})`,
    height: 'calc(100% - 35px)',
    overflowY: 'scroll',
  };

  const menuSelected = (menu: string): string => {
    return selectingMenu == menu ? "selected" : "";
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
        placeholder={"検索 or 新規作成"}
        onChange={onSearchTagTextChange} />

      <div className="tag-ctrl-panel" style={tagGroupAreaStyle}>
        <div className={`menu-item ${menuSelected(MenuItem.ALL_TAG)}`} onClick={() => onMenuClick(MenuItem.ALL_TAG)}>すべてのタグ</div>
        <div className={`menu-item ${menuSelected(MenuItem.UNCATEGORIZED_TAG)}`} onClick={() => onMenuClick(MenuItem.UNCATEGORIZED_TAG)}>未分類のタグ</div>
        { tagGroupListState.map((tg:any) => {
          return (
            <div
              className={`menu-item ${menuSelected(tg.tagGroupId)}`}
              onClick={() => onMenuClick(tg.tagGroupId)} >
                {tg.name}
              </div>
          );
        }) }
      </div>

      <div style={tagAreaStyle}>
        <div>
          {(() => {
            // 入力したタグ名が登録されていないとき、新規追加UIを表示する
            if ( !showingTagAllListState.map(t=>t.name).includes(searchTagText) ) {
              return (
                <div>
                  <Tag
                    workspaceId={props.workspaceId}
                    tagId={null}
                    tagName={`追加:${searchTagText}`}
                    favorite={false}
                    delete={false}
                    alreadyAdded={false}
                    onClick={()=>{createNewTag(searchTagText)}}
                    onDeleteClick={null}
                  />
                </div>
              );
            }
          })()}

          { showingTagAllListState.map((t) => {
            if ( searchTagText.length == 0 || t.name.indexOf(searchTagText) != -1 ) {
              return (
                <Tag
                  workspaceId={props.workspaceId}
                  tagId={t.tagId}
                  tagName={t.name}
                  favorite={t.favorite}
                  delete={false}
                  alreadyAdded={alreadyLinkedTagId.includes(t.tagId)}
                  onClick={()=>{addTagToImage(t.tagId)}}
                  onDeleteClick={props.onRemoveTag}
                />
              );
            }
          }) }
        </div>
      </div>
    </div>
  );
}
