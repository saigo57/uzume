import React from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

// TODO: CSS in JSに置き換えたい
import './tag.scss';

type TagProps = {
  tagName: string;
};

export const Tag:React.VFC<TagProps> = (props) => {
  return (
    <div className="tag">
      <div className="tag-text">{props.tagName}</div>
      <FontAwesomeIcon icon={faTimes} />
    </div>
  );
}
