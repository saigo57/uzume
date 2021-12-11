import React, { useState, useEffect} from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { faStepForward } from "@fortawesome/free-solid-svg-icons";
import { faStepBackward } from "@fortawesome/free-solid-svg-icons";

import { ImageIndexView } from "./imageIndexView";
import { ImageView } from "./imageView";
import { ImageSideBar } from "./imageSideBar";

type BrowseImageProps = {
  workspaceId: string
  imageId: string | null
  onModeChange: (imageId: string | null) => void
  onPrevClick: () => void
};

export const BrowseImage:React.VFC<BrowseImageProps> = (props) => {
  const [selectedImageIds, setSelectedImageIds] = useState([] as string[]);

  useEffect(() => {
    setSelectedImageIds([])
  }, [props.workspaceId]);

  const onImageDoubleClick = (imageId: string) => {
    props.onModeChange(imageId)
  };

  const onChangeSelectedImages = (imageIds: string[]) => {
    setSelectedImageIds(imageIds)
  };

  return (
    <>
      <section id="browse-image-area" className="browse-image-area">
        <div className="main-header-area">
          <div className="prev" onClick={props.onPrevClick}>
            <FontAwesomeIcon icon={faArrowLeft} />
          </div>
          <div className="search-bar"></div>
          <div className="control-panel">
            <div className="back-foward">
              <FontAwesomeIcon icon={faStepBackward} />
              <FontAwesomeIcon icon={faStepForward} />
            </div>
          </div>
        </div>

        <ImageIndexView
          workspaceId={props.workspaceId}
          onChangeSelectedImages={onChangeSelectedImages}
          onImageDoubleClick={onImageDoubleClick}
          hide={!!props.imageId} />

        {(() => {
          if ( props.imageId ) {
            return <ImageView workspaceId={props.workspaceId} imageId={props.imageId}/>;
          }
        })()}
      </section>

      <div id="after-browse-image-area" className="split-bar"></div>

      <ImageSideBar workspaceId={props.workspaceId} imageIds={selectedImageIds} />
    </>
  );
}
