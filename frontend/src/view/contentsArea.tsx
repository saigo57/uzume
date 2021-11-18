import React, { useState, useEffect} from 'react';
import { BrowseImage } from "./contents/browseImage";

type contentsAreaProps = {
  workspaceId: string
  showIndexImageEvent: number
};

type ContentsState = {
  showContent: string // BrowseImage or ...
  browseImageMode: string // index or image
}

export const ContentsArea:React.VFC<contentsAreaProps> = (props) => {
  const [showAImageState, setShowAImage] = useState(null as string | null);

  useEffect(() => {
    setShowAImage(null)
  }, [props.showIndexImageEvent]);

  const onBrowseImageModeChange = (imageId: string | null) => {
    setShowAImage(imageId)
  };

  const onPrevClick = () => {
    setShowAImage(null)
  };

  // TODO: 設定画面などはここで分岐させる
  return (
    <BrowseImage
      workspaceId={props.workspaceId}
      imageId={showAImageState}
      onModeChange={onBrowseImageModeChange}
      onPrevClick={onPrevClick} />
  );
}
