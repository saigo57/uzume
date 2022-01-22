import React, { useState, useEffect} from 'react';
import { BrowseImage } from "./contents/browseImage";

type contentsAreaProps = {
  workspaceId: string
  uncategorized: boolean
  showIndexImageEvent: number
  uncategorizedEvent: number
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

  useEffect(() => {
    setShowAImage(null)
  }, [props.uncategorizedEvent]);

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
      uncategorized={props.uncategorized}
      onModeChange={onBrowseImageModeChange}
      onPrevClick={onPrevClick} />
  );
}
