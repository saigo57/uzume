import React, { useState, useEffect} from 'react';
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

type TagCtrlPanelProps = {
  display: boolean
  workspaceId: string
  imageIds: string[]
  tagInfoList: TagInfo[]
  alreadyLinkedTag: TagInfo[]
  onClose: ()=>void
  onRemoveTag: ((tagId: string) => void) | null
}

export const TagCtrlPanel:React.VFC<TagCtrlPanelProps> = (props) => {
  const [searchTagText, setSearchTagText] = useState('');

  useEffect(() => {
    if ( !props.display ) setSearchTagText('');
  }, [props.display]);

  const style: React.CSSProperties = {
    position: 'relative',
    display: props.display ? 'block' : 'none',
    height: '200px',
    margin: '8px',
  }

  const onSearchTagTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTagText(e.target.value)
  };

  const createNewTag = (tagName: string) => {
    if ( props.imageIds.length == 0 ) return;

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

  return (
    <div style={style}>
      <input type="text" name="tag-search" value={searchTagText} onChange={onSearchTagTextChange} />

      {(() => {
        // 入力したタグ名が登録されていないとき、新規追加UIを表示する
        if ( !props.tagInfoList.map(t=>t.name).includes(searchTagText) ) {
          return (
            <div>
              <Tag
                tagId={null}
                tagName={`追加:${searchTagText}`}
                delete={false}
                alreadyAdded={false}
                onClick={()=>{createNewTag(searchTagText)}}
                onDeleteClick={null}
              />
            </div>
          );
        }
      })()}

      <div style={{  }}>
        { props.tagInfoList.map((t) => {
            if ( searchTagText.length == 0 || t.name.indexOf(searchTagText) != -1 ) {
              return (
                <Tag
                  tagId={t.tagId}
                  tagName={t.name}
                  delete={false}
                  alreadyAdded={alreadyLinkedTagId.includes(t.tagId)}
                  onClick={()=>{addTagToImage(t.tagId)}}
                  onDeleteClick={props.onRemoveTag}
                />
              );
            }
        }) }
      </div>

      <div style={{ position: 'absolute', height: '18px', width: '100%', bottom: 0 }}
           onClick={()=>{ if ( props.onClose ) props.onClose(); }}>閉じる</div>
    </div>
  );
}
