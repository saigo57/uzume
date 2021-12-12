import React, { useState, useEffect} from 'react';
import { Tag } from "../atmos/tag";
import CssConst from "./../../cssConst";
import {
  TagInfo,
} from '../../../ipc/tags'

type SearchPanelProps = {
  id: string
  display: boolean
  tagInfoList: TagInfo[]
  selectedTag: TagInfo[]
  onTagAddClick: (tagId: string | null, tagName: string) => void
  onTagDeleteClick: (tagId: string) => void
}

export const SearchPanel:React.VFC<SearchPanelProps> = (props) => {
  const style: React.CSSProperties = {
    position: 'absolute',
    display: props.display ? 'block' : 'none',
    top: '37px',
    height: '300px',
    width: '400px',
    padding: '8px',
    backgroundColor: CssConst.MAIN_BACKGROUND_COLOR,
    border: `1px solid ${CssConst.EDGE_GRAY}`,
    zIndex: 10,
  }

  let selectedTagIds = props.selectedTag.map(t => t.tagId);

  return (
    <div id={props.id} style={style}>
      { props.tagInfoList.map((t) => {
          return (
            <Tag
              tagId={t.tagId}
              tagName={t.name}
              delete={false}
              alreadyAdded={selectedTagIds.includes(t.tagId)}
              onClick={props.onTagAddClick}
              onDeleteClick={props.onTagDeleteClick}
            />
          );
      }) }
    </div>
  );
}
