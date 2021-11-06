import React from 'react';
import './ImageList.scss';

import { ImagePreview, ImagePreviewProps } from '../../Atoms/ImagePreview/ImagePreview';

export type ImageListProps = {
    ImagePreviewItems : ImagePreviewProps[]
}

export const ImageList:React.VFC<ImageListProps> = (ImageListProps) => {

    return (
        <div className="thumbnail-area" >
            {ImageListProps.ImagePreviewItems.map((data)=>{return (<ImagePreview {...data}/>)})}
        </div>
    );
}