import React, { useState, useEffect} from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import {
  IpcId as ImageIpcId,
  RequestImageInfo,
  ImageInfo,
  RemoveTagFromImage,
} from '../../ipc/images'
import {
  IpcId as TagsIpcId,
  GetAllTags,
  TagInfo,
  TagList,
} from '../../ipc/tags'
import { Tag } from "../component/atmos/tag";
import { TagCtrlPanel } from "../component/organisms/tagCtrlPanel";

type ImageSideBarProps = {
  workspaceId: string
  imageIds: string[]
};

export const ImageSideBar:React.VFC<ImageSideBarProps> = (props) => {
  const [tagListState, setTagList] = useState([] as TagInfo[]);
  const [imageInfo, setImageInfo] = useState({
    image_id: '',
    file_name: '',
    ext: '',
    memo: '',
    author: '',
    created_at: '',
  } as ImageInfo);
  const [isShowTagCtrlPanel, setIsShowTagCtrlPanel] = useState(false);

  useEffect(() => {
    updateImageInfo();
    if ( props.imageIds.length == 0 ) setIsShowTagCtrlPanel(false);
  }, [props.imageIds]);

  useEffect(() => {
    window.api.on(ImageIpcId.GET_IMAGE_INFO_REPLY, (_e, arg) => {
      const imageInfo = JSON.parse(arg) as ImageInfo
      setImageInfo(imageInfo)
    });
  }, []);

  useEffect(() => {
    let req = {
      workspaceId: props.workspaceId,
    } as GetAllTags

    window.api.send(TagsIpcId.GET_ALL_TAGS, JSON.stringify(req));
  }, [props.workspaceId]);

  useEffect(() => {
    window.api.on(TagsIpcId.GET_ALL_TAGS_REPLY, (_e, arg) => {
      const tagList = JSON.parse(arg) as TagList
      setTagList(tagList.tags)
    });
  }, []);

  useEffect(() => {
    window.api.on(ImageIpcId.IMAGE_INFO_UPDATED_REPLY, (_e, arg) => {
      const imageInfoList = JSON.parse(arg) as ImageInfo[]
      setImageInfo(imageInfoList[0]);
    });
  }, []);

  const updateImageInfo = () => {
    // TODO:今は1個目の画像のみ
    let imageInfo = {
      image_id: props.imageIds[0],
      file_name: '', ext: '', memo: '', author: '', created_at: '',
    } as ImageInfo;

    if ( props.imageIds.length == 1 ) {
      imageInfo.image_id = props.imageIds[0]
      let req = {
        workspaceId: props.workspaceId,
        imageId: props.imageIds[0],
      } as RequestImageInfo
      window.api.send(ImageIpcId.GET_IMAGE_INFO, JSON.stringify(req));
    }

    setImageInfo(imageInfo)
  }

  const onTagAreaClick = () => {
    setIsShowTagCtrlPanel(prev => (!prev && props.imageIds.length > 0))
  }

  const linkedTag = () => {
    let linkedTags: TagInfo[] = []
    tagListState.forEach((t) => {
      if ( imageInfo.tags && imageInfo.tags.includes(t.tagId) ) linkedTags.push(t);
    });
    return linkedTags;
  }

  const removeTag = (tagId: string) => {
    let req: RemoveTagFromImage = {
      workspaceId: props.workspaceId,
      imageId: imageInfo.image_id,
      tagId: tagId,
    }
    window.api.send(ImageIpcId.REMOVE_TAG, JSON.stringify(req));
  }

  let linkedTagList = linkedTag()

  return (
    <section id="image-side-bar" className="image-side-bar">
      <div className="side-bar-title"><div className="side-bar-title-text">Tag</div></div>
      <div className="tag-area" onClick={onTagAreaClick}>
        <div className="tagged-area">
          { linkedTagList.map((t) => {
              return (
                <Tag
                  tagId={t.tagId}
                  tagName={t.name}
                  delete={true}
                  alreadyAdded={false}
                  onClick={null}
                  onDeleteClick={removeTag}
                />
              )
            })
          }
        </div>
      </div>
      <TagCtrlPanel
        workspaceId={props.workspaceId}
        display={isShowTagCtrlPanel}
        imageIds={props.imageIds}
        tagInfoList={tagListState}
        alreadyLinkedTag={linkedTagList}
        onRemoveTag={removeTag}
        onClose={() => { setIsShowTagCtrlPanel(false) }}
      />
      <div className="side-bar-title"><div className="side-bar-title-text">Info</div></div>
      <ul className="info-area">
        <li className="info-item">
          <div className="info-title">メモ</div>
          <textarea name="memo" className="info-body editable memo" value="画像についてのメモを記述する。編集はreactのstateを介して行う必要があるよう。" />
        </li>
        <li className="info-item">
          <div className="info-title">作者</div>
          <input type="text" name="author" className="info-body editable" value="ジャムおじさん" />
        </li>
        <div className="info-item-block-separator"></div>
        <li className="info-item">
          <div className="info-title">ファイル名</div>
          <div className="info-body freezed">{imageInfo.file_name}</div>
        </li>
        <li className="info-item">
          <div className="info-title">UUID</div>
          <div className="info-body freezed">{imageInfo.image_id}</div>
        </li>
        <li className="info-item">
          <div className="info-title">形式</div>
          <div className="info-body freezed">{imageInfo.ext}</div>
        </li>
        <li className="info-item">
          <div className="info-title">登録日</div>
          <div className="info-body freezed">{imageInfo.created_at}</div>
        </li>
        <li className="info-item">
          <div className="info-title">解像度</div>
          <div className="info-body freezed">256 × 256</div>
        </li>
        <li className="info-item">
          <div className="info-title">容量</div>
          <div className="info-body freezed">2.43MB</div>
        </li>
      </ul>
    </section>
  );
}
