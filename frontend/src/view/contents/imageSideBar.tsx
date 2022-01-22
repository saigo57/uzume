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
import {
  sendIpcGetAllTags,
} from '../commonIpc';

type ImageSideBarProps = {
  workspaceId: string
  imageIds: string[]
  dsb_ref: React.RefObject<HTMLDivElement>
};

export const ImageSideBar:React.VFC<ImageSideBarProps> = (props) => {
  const [tagListState, setTagList] = useState([] as TagInfo[]);
  const [imageInfoList, setImageInfoList] = useState([] as ImageInfo[]);
  const [isShowTagCtrlPanel, setIsShowTagCtrlPanel] = useState(false);

  useEffect(() => {
    updateImageInfo();
    if ( props.imageIds.length == 0 ) setIsShowTagCtrlPanel(false);
  }, [props.imageIds]);

  useEffect(() => {
    window.api.on(ImageIpcId.GET_IMAGE_INFO_LIST_REPLY, (_e, arg) => {
      const imageInfoList = JSON.parse(arg) as ImageInfo[]
      setImageInfoList(imageInfoList)
    });
  }, []);

  useEffect(() => {
    sendIpcGetAllTags(props.workspaceId)
  }, [props.workspaceId]);

  useEffect(() => {
    window.api.on(TagsIpcId.GET_ALL_TAGS_REPLY, (_e, arg) => {
      const tagList = JSON.parse(arg) as TagList
      setTagList(tagList.tags)
    });
  }, []);

  useEffect(() => {
    window.api.on(ImageIpcId.IMAGE_INFO_LIST_UPDATED_REPLY, (_e, arg) => {
      const imageInfoList = JSON.parse(arg) as ImageInfo[]
      setImageInfoList(imageInfoList);
    });
  }, []);

  const updateImageInfo = () => {
    let imageInfoList = props.imageIds.map(image_id => ({
      image_id: image_id,
      file_name: '', ext: '', memo: '', author: '', created_at: '',
    } as ImageInfo));

    let req = {
      workspaceId: props.workspaceId,
      imageIds: props.imageIds,
    } as RequestImageInfo
    window.api.send(ImageIpcId.GET_IMAGE_INFO_LIST, JSON.stringify(req));

    setImageInfoList(imageInfoList)
  }

  const onTagAreaClick = () => {
    setIsShowTagCtrlPanel(prev => (!prev && props.imageIds.length > 0))
  }

  const linkedTag = () => {
    // 複数の画像を選択しているときは、共通しているタグのみ表示する
    var tagCount: { [key: string]: number } = {}
    var allImageCount: number = 0;
    if ( !imageInfoList ) return [];

    // タグが何枚の画像に付与されているかをカウントする
    imageInfoList.forEach((imageInfo) => {
      allImageCount++;
      if ( imageInfo && imageInfo.tags ) {
        imageInfo.tags.forEach((tag) => {
          if ( !tagCount[tag] ) tagCount[tag] = 0;
          tagCount[tag]++;
        });
      }
    });

    let linkedTags: TagInfo[] = []
    tagListState.forEach((t) => {
      // タグのカウントと画像の枚数と同じ = すべての画像に付与されている
      if ( tagCount[t.tagId] == allImageCount ) linkedTags.push(t);
    });
    return linkedTags;
  }

  const removeTag = (tagId: string) => {
    let req: RemoveTagFromImage = {
      workspaceId: props.workspaceId,
      imageIds: props.imageIds,
      tagId: tagId,
    }
    window.api.send(ImageIpcId.REMOVE_TAG, JSON.stringify(req));
  }

  let linkedTagList = linkedTag();
  let showImageInfo = {
    image_id: '',
    file_name: '', ext: '', memo: '', author: '', created_at: '',
  } as ImageInfo;
  if ( imageInfoList.length == 1 ) showImageInfo = imageInfoList[0];

  return (
    <section id="image-side-bar" className="image-side-bar" ref={props.dsb_ref}>
      <div className="side-bar-title"><div className="side-bar-title-text">Tag</div></div>
      <div className="tag-area" onClick={onTagAreaClick}>
        <div className="tagged-area">
          { linkedTagList.map((t) => {
              return (
                <Tag
                  workspaceId={props.workspaceId}
                  tagId={t.tagId}
                  tagName={t.name}
                  favorite={t.favorite}
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
          <div className="info-body freezed">{showImageInfo.file_name}</div>
        </li>
        <li className="info-item">
          <div className="info-title">UUID</div>
          <div className="info-body freezed">{showImageInfo.image_id}</div>
        </li>
        <li className="info-item">
          <div className="info-title">形式</div>
          <div className="info-body freezed">{showImageInfo.ext}</div>
        </li>
        <li className="info-item">
          <div className="info-title">登録日</div>
          <div className="info-body freezed">{showImageInfo.created_at}</div>
        </li>
        <li className="info-item">
          <div className="info-title">解像度</div>
          <div className="info-body freezed">{showImageInfo.width} × {showImageInfo.height}</div>
        </li>
        <li className="info-item">
          <div className="info-title">容量</div>
          <div className="info-body freezed">2.43MB</div>
        </li>
      </ul>
    </section>
  );
}
