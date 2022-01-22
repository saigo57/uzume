import React, { useState, useEffect} from 'react';
import { BrowseImage } from "./contents/browseImage";
import { TagManage } from "./contents/tagManage";
import { Event } from './lib/eventCustomHooks';

type contentsAreaProps = {
  workspaceId: string
  uncategorized: boolean
  showIndexImageEvent: Event
  uncategorizedEvent: Event
  tagManageEvent: Event
  singleTagClickEvent: Event
  dsb_ref: React.RefObject<HTMLDivElement>
};

type ContentsState = {
  showContent: string // BrowseImage or ...
  browseImageMode: string // index or image
}

export const ContentsArea:React.VFC<contentsAreaProps> = (props) => {
  const [currMode, setCurrMode] = useState("browse_image");
  const [showAImageState, setShowAImage] = useState(null as string | null);

  useEffect(() => {
    setCurrMode("browse_image")
    setShowAImage(null)
  }, [props.showIndexImageEvent]);

  useEffect(() => {
    setCurrMode("browse_image")
    setShowAImage(null)
  }, [props.uncategorizedEvent]);

  useEffect(() => {
    setCurrMode("tag_manage")
    setShowAImage(null)
  }, [props.tagManageEvent]);

  const onBrowseImageModeChange = (imageId: string | null) => {
    setShowAImage(imageId)
  };

  const onPrevClick = () => {
    setShowAImage(null)
  };

  if ( currMode == "tag_manage" ) {
    return (
      <TagManage workspaceId={props.workspaceId} dsb_ref={props.dsb_ref} />
    );
  } else {
    return (
      <BrowseImage
        workspaceId={props.workspaceId}
        imageId={showAImageState}
        singleTagClickEvent={props.singleTagClickEvent}
        uncategorized={props.uncategorized}
        onModeChange={onBrowseImageModeChange}
        onPrevClick={onPrevClick}
        dsb_ref={props.dsb_ref}
        />
    );
  }
}
