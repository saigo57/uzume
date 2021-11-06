import React from 'react';
import './ImagePreview.scss';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";

export type ImagePreviewProps = {
    ImagePath: string
}

export const ImagePreview: React.VFC<ImagePreviewProps> = (props: ImagePreviewProps) =>
{
    return (
        <div className="thumbnail">
            <img src={props.ImagePath} alt=""></img>
            <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
        </div>
    );
}
