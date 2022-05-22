import React, { useState, useEffect, useRef } from 'react';
import { useDraggableSplitBar } from '../lib/draggableSplitBarHooks';
import { useTags } from '../lib/tagCustomHooks';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { faStepForward } from "@fortawesome/free-solid-svg-icons";
import { faStepBackward } from "@fortawesome/free-solid-svg-icons";
import { Tag } from "./../component/atmos/tag";
import { SearchPanel } from "./../component/organisms/searchPanel";
import { ImageIndexView } from "./imageIndexView";
import { ImageView } from "./imageView";
import { ImageSideBar } from "./imageSideBar";
import { TagInfo } from '../../ipc/tags';
import { sendIpcGetAllTags } from '../commonIpc';
import { IpcId as ImagesIpcId, ShowImages } from '../../ipc/images';
import { useEvent, Event } from './../lib/eventCustomHooks';

type BrowseImageProps = {
  display: boolean
  workspaceId: string
  imageId: string | null
  uncategorized: boolean
  singleTagClickEvent: Event
  onModeChange: (imageId: string | null) => void
  onPrevClick: () => void
  dsb_ref: React.RefObject<HTMLDivElement>
};

export const BrowseImage:React.VFC<BrowseImageProps> = (props) => {
  const [selectedImageIds, setSelectedImageIds] = useState([] as string[]);
  const [searchTags, setSearchTags] = useState([] as TagInfo[]);
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [searchType, setSearchType] = useState('and');
  const [tagGroupListState, tagAllListState, _showingTagAllListState, resetTagList, selectingMenu, selectMenu] = useTags(props.workspaceId);
  const [singleClickTagId, setSingleClickTagId] = useState(null as string | null);
  const [onShowImagesEvent, raiseOnShowImagesEvent] = useEvent(null);

  useEffect(() => {
    setSelectedImageIds([])
    setSearchTags([])
    resetTagList()
    sendIpcGetAllTags(props.workspaceId)

    showImages()
  }, [props.workspaceId]);

  useEffect(() => {
    setSearchTags([])
  }, [props.uncategorized]);

  useEffect(() => {
    const tagId = props.singleTagClickEvent.data;
    setSingleClickTagId(tagId)
  }, [props.singleTagClickEvent]);

  useEffect(() => {
    setSearchTags((state) => {
      const tagId = singleClickTagId;
      if ( !tagId ) return state;
      return tagAllListState.filter((tag:any) => tagId == tag.tagId);
    });

    setSingleClickTagId(null)
    showImages()
  }, [singleClickTagId]);

  useEffect(() => {
    showImages()
  }, [searchTags.length, searchType, singleClickTagId]); // renameのときは発火させない

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

  useEffect(() => {
    setSearchTags((state) => {
      const tagIds = state.map(s => s.tagId);
      return tagAllListState.filter((tag:any) => tagIds.includes(tag.tagId));
    });
  }, [tagAllListState]);

  const showImages = () => {
    if ( props.workspaceId == "" ) return;

    const showImages: ShowImages = {
      workspaceId: props.workspaceId,
      page: 1,
      tagIds: searchTags.map(tag => tag.tagId),
      searchType: searchType,
      uncategorized: props.uncategorized,
    }
    raiseOnShowImagesEvent(null)
    window.api.send(ImagesIpcId.ToMainProc.SHOW_IMAGES, JSON.stringify(showImages));
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

    const clickTags = tagAllListState.filter((tag: any) => tag.tagId == tagId);
    if ( clickTags.length == 0 ) return;
    const clickTag = clickTags[0];
    setSearchTags((state) => [...state, clickTag])
  };

  const onSearchPanelTagDeleteClick = (tagId: string) => {
    setSearchTags(state => state.filter((tag) => tag.tagId != tagId))
  };

  const toggleSearchType = (_tagId: string|null, _tagName: string) => {
    setSearchType(type => type == 'and' ? 'or' : 'and')
  };

  const clearSearchTags = () => {
    setSearchTags([])
  };

  const dsb_split_bar = useRef<HTMLDivElement>(null);
  const dsb_right = useRef<HTMLDivElement>(null);
  useDraggableSplitBar(props.dsb_ref, dsb_split_bar, dsb_right)
  
  if ( !props.display ) return <></>;

  return (
    <>
      <section id="browse-image-area" className="browse-image-area" ref={props.dsb_ref}>
        <div className="main-header-area">
          <div className="prev" onClick={props.onPrevClick}>
            <FontAwesomeIcon icon={faArrowLeft} />
          </div>
          <div id="search-bar-id" className="search-bar" onClick={searchBarClick}>
            <Tag
              workspaceId={props.workspaceId}
              tagId={null}
              tagName={`type:${searchType}`}
              favorite={false}
              delete={false}
              alreadyAdded={false}
              onClick={toggleSearchType}
              onDeleteClick={null}
            />
            { searchTags.map((t) => {
              return (
                <Tag
                  workspaceId={props.workspaceId}
                  tagId={t.tagId}
                  tagName={t.name}
                  favorite={t.favorite}
                  delete={true}
                  alreadyAdded={false}
                  onClick={searchBarClick}
                  onDeleteClick={onSearchPanelTagDeleteClick}
                />
              );
            }) }
          </div>
          {/* <div className="control-panel">
            <div className="back-foward">
              <FontAwesomeIcon icon={faStepBackward} />
              <FontAwesomeIcon icon={faStepForward} />
            </div>
          </div> */}

          <SearchPanel
            id="search-panel-id"
            display={showSearchPanel}
            workspaceId={props.workspaceId}
            selectedTag={searchTags}
            onTagAddClick={onSearchPanelTagAddClick}
            onTagDeleteClick={onSearchPanelTagDeleteClick}
          />
        </div>

        <ImageIndexView
          workspaceId={props.workspaceId}
          onChangeSelectedImages={onChangeSelectedImages}
          onImageDoubleClick={onImageDoubleClick}
          clearSearchTags={clearSearchTags}
          hide={!!props.imageId}
          tagIds={searchTags.map(tag => tag.tagId)}
          searchType={searchType}
          uncategorized={props.uncategorized}
          onShowImagesEvent={onShowImagesEvent}
        />

        {(() => {
          if ( props.imageId ) {
            return <ImageView workspaceId={props.workspaceId} imageId={props.imageId}/>;
          }
        })()}
      </section>

      <div id="after-browse-image-area" className="split-bar" ref={dsb_split_bar}></div>

      <ImageSideBar workspaceId={props.workspaceId} imageIds={selectedImageIds} dsb_ref={dsb_right} />
    </>
  );
}
