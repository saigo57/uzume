import React, { useState, useEffect} from 'react';
import { BrowseImage } from "./contents/browseImage";

type contentsAreaProps = {
  workspaceId: string
};

export const ContentsArea:React.VFC<contentsAreaProps> = (props) => {
  // TODO: 設定画面などはここで分岐させる
  return (
    <BrowseImage workspaceId={props.workspaceId} />
  );
}
