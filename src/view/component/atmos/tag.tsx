import React, { useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import {
  IpcId as TagsIpcId,
  ShowContextMenu,
} from '../../../ipc/tags'

// TODO: CSS in JSに置き換えたい
import './tag.scss';

type TagProps = {
  workspaceId: string
  tagId: string|null
  tagName: string
  favorite: boolean
  delete: boolean
  alreadyAdded: boolean
  onClick: ((tagId: string|null, tagName: string) => void) | null
  onDeleteClick: ((tagId: string) => void) | null
};

export const Tag:React.VFC<TagProps> = (props) => {
  const [{ isDragging }, dragRef] = useDrag({
    type: 'Item',
    item: { tagId: props.tagId },
    collect: (monitor) => ({
        isDragging: monitor.isDragging()
    })
  });

  const onTagClick = (e:any) => {
    e.stopPropagation();
    e.preventDefault();

    if ( props.alreadyAdded ) {
      if ( props.onDeleteClick && props.tagId ) props.onDeleteClick(props.tagId);
    } else {
      if ( props.onClick ) props.onClick(props.tagId, props.tagName);
    }
  }

  const onDeleteIconClick = (e:any) => {
    e.stopPropagation();
    e.preventDefault();
    if ( props.onDeleteClick && props.tagId ) props.onDeleteClick(props.tagId);
  }

  const onContextMenu = () => {
    if ( !props.tagId ) return;

    const req: ShowContextMenu = {
      workspaceId: props.workspaceId,
      tagId: props.tagId,
      tagName: props.tagName,
      currFavorite: props.favorite
    }
    window.api.send(TagsIpcId.SHOW_CONTEXT_MENU, JSON.stringify(req))
  }

  return (
    <div
      className={`tag ${props.delete ? 'disp-delete' : ''} ${props.alreadyAdded ? 'added' : ''}`}
      onClick={onTagClick}
      onContextMenu={onContextMenu}
      ref={dragRef}
    >
      <div className="tag-text">{props.tagName}</div>
      {(() => {
        if ( props.delete ) {
          return (
            <FontAwesomeIcon
              icon={faTimes}
              onClick={onDeleteIconClick}
            />
          );
        }
      })()}
    </div>
  );
}
