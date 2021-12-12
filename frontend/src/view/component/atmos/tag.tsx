import React from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

// TODO: CSS in JSに置き換えたい
import './tag.scss';

type TagProps = {
  tagId: string|null
  tagName: string
  delete: boolean
  alreadyAdded: boolean
  onClick: ((tagId: string|null, tagName: string) => void) | null
  onDeleteClick: ((tagId: string) => void) | null
};

export const Tag:React.VFC<TagProps> = (props) => {
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

  return (
    <div
      className={`tag ${props.delete ? 'disp-delete' : ''} ${props.alreadyAdded ? 'added' : ''}`}
      onClick={onTagClick}
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
