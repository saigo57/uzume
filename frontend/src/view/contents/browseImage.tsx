import React, { useState, useEffect} from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { faStepForward } from "@fortawesome/free-solid-svg-icons";
import { faStepBackward } from "@fortawesome/free-solid-svg-icons";
import { Tag } from "./../component/atmos/tag";
import { SearchPanel } from "./../component/organisms/searchPanel";
import { ImageIndexView } from "./imageIndexView";
import { ImageView } from "./imageView";
import { ImageSideBar } from "./imageSideBar";
import {
  IpcId as TagsIpcId,
  TagInfo,
  TagList,
} from '../../ipc/tags';
import {
  sendIpcGetAllTags,
} from '../commonIpc';
import {
  IpcId as ImagesIpcId,
  ShowImages,
} from '../../ipc/images'

type BrowseImageProps = {
  workspaceId: string
  imageId: string | null
  uncategorized: boolean
  onModeChange: (imageId: string | null) => void
  onPrevClick: () => void
};

export const BrowseImage:React.VFC<BrowseImageProps> = (props) => {
  const [selectedImageIds, setSelectedImageIds] = useState([] as string[]);
  const [tagListState, setTagList] = useState([] as TagInfo[]);
  const [searchTags, setSearchTags] = useState([] as TagInfo[]);
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [searchType, setSearchType] = useState('and');

  useEffect(() => {
    setSelectedImageIds([])
    setTagList([])
    setSearchTags([])
    sendIpcGetAllTags(props.workspaceId)

    showImages()
  }, [props.workspaceId]);

  useEffect(() => {
    setSearchTags([])
  }, [props.uncategorized]);

  useEffect(() => {
    showImages()
  }, [searchTags, searchType]);

  useEffect(() => {
    window.api.on(TagsIpcId.GET_ALL_TAGS_REPLY, (_e, arg) => {
      const tagList = JSON.parse(arg) as TagList
      setTagList(tagList.tags)
    });
  }, []);

  useEffect(() => {
    if ( showSearchPanel ) {
      document.addEventListener('click', (e) => {
        const elm = e.target as HTMLElement | null;
        if ( !elm?.closest('#search-panel-id') && !elm?.closest('#search-bar-id') ) {
          setShowSearchPanel(false)
        }
      });
    }
  }, [showSearchPanel]);

  const showImages = () => {
    const showImages: ShowImages = {
      workspaceId: props.workspaceId,
      page: 1,
      tagIds: searchTags.map(tag => tag.tagId),
      searchType: searchType,
      uncategorized: props.uncategorized,
    }
    window.api.send(ImagesIpcId.SHOW_IMAGES, JSON.stringify(showImages));
  }

  const onImageDoubleClick = (imageId: string) => {
    props.onModeChange(imageId)
  };

  const onChangeSelectedImages = (imageIds: string[]) => {
    setSelectedImageIds(imageIds)
  };

  const searchBarClick = () => {
    setShowSearchPanel(true);
  };

  const onSearchPanelTagAddClick = (tagId: string | null, _tagName: string) => {
    if ( !tagId  ) return;

    var clickTags = tagListState.filter((tag) => tag.tagId == tagId);
    if ( clickTags.length == 0 ) return;
    var clickTag = clickTags[0];
    setSearchTags((state) => [...state, clickTag])
  };

  const onSearchPanelTagDeleteClick = (tagId: string) => {
    setSearchTags(state => state.filter((tag) => tag.tagId != tagId))
  };

  const toggleSearchType = (_tagId: string|null, _tagName: string) => {
    setSearchType(type => type == 'and' ? 'or' : 'and')
  };

  return (
    <>
      <section id="browse-image-area" className="browse-image-area">
        <div className="main-header-area">
          <div className="prev" onClick={props.onPrevClick}>
            <FontAwesomeIcon icon={faArrowLeft} />
          </div>
          <div id="search-bar-id" className="search-bar" onClick={searchBarClick}>
            <Tag
              tagId={null}
              tagName={`type:${searchType}`}
              delete={false}
              alreadyAdded={false}
              onClick={toggleSearchType}
              onDeleteClick={null}
            />
            { searchTags.map((t) => {
              return (
                <Tag
                  tagId={t.tagId}
                  tagName={t.name}
                  delete={true}
                  alreadyAdded={false}
                  onClick={searchBarClick}
                  onDeleteClick={onSearchPanelTagDeleteClick}
                />
              );
            }) }
          </div>
          <div className="control-panel">
            <div className="back-foward">
              <FontAwesomeIcon icon={faStepBackward} />
              <FontAwesomeIcon icon={faStepForward} />
            </div>
          </div>

          <SearchPanel
            id="search-panel-id"
            display={showSearchPanel}
            tagInfoList={tagListState}
            selectedTag={searchTags}
            onTagAddClick={onSearchPanelTagAddClick}
            onTagDeleteClick={onSearchPanelTagDeleteClick}
          />
        </div>

        <ImageIndexView
          workspaceId={props.workspaceId}
          onChangeSelectedImages={onChangeSelectedImages}
          onImageDoubleClick={onImageDoubleClick}
          hide={!!props.imageId}
          tagIds={searchTags.map(tag => tag.tagId)}
          searchType={searchType}
          uncategorized={props.uncategorized}
        />

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
