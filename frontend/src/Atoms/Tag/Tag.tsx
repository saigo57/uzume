import React from 'react';
import './Tag.scss';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

type TagProps = {
    TagName: string
};

export const Tag:React.VFC<TagProps> = (props: TagProps) =>
{
    return (
        <li className='tag'>
            <div className='tag-text'>
                {props.TagName}
            </div>
            <FontAwesomeIcon icon={faTimes} />
        </li>
    );
}