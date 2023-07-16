import React, { useState, useEffect, useRef } from 'react'
import { useRecoilState, useSetRecoilState } from 'recoil'
import { tagListAtom } from '../recoil/tagListAtom'
import { searchTagsAtom, searchTypeAtom } from '../recoil/searchAtom'
import { reloadImagesEventAtom } from '../recoil/eventAtom'
import { useDraggableSplitBar } from '../lib/draggableSplitBarHooks'
import { useTags } from '../lib/tagCustomHooks'
import { useEvent, useRecoilEvent, Event } from './../lib/eventCustomHooks'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faRotateRight, faChevronRight, faChevronLeft } from '@fortawesome/free-solid-svg-icons'
import { Tag } from './../component/atmos/tag'
import { SearchPanel } from './../component/organisms/searchPanel'
import { ImageIndexView } from './imageIndexView'
import { ImageView } from './imaveView/imageView'
import { ImageSideBar } from './imageSideBar'
import { sendIpcGetAllTags } from '../commonIpc'
import { IpcId as ImagesIpcId } from '../../ipc/images'

type BrowseImageProps = {
  display: boolean
  workspaceId: string
  imageId: string | null
  uncategorized: boolean
  singleTagClickEvent: Event
  onModeChange: (imageId: string | null) => void
  onPrevClick: () => void
  dsb_ref: React.RefObject<HTMLDivElement>
}

export const BrowseImage: React.VFC<BrowseImageProps> = props => {
  const setTagAllList = useSetRecoilState(tagListAtom)
  const [selectedImageIds, setSelectedImageIds] = useState([] as string[])
  const [searchTags, setSearchTags] = useRecoilState(searchTagsAtom)
  const [showSearchPanel, setShowSearchPanel] = useState(false)
  const [searchType, setSearchType] = useRecoilState(searchTypeAtom)
  const [tagAllListState, _showingTagAllListState, resetTagList, _selectingMenu, _selectMenu] = useTags(
    props.workspaceId
  )
  const [singleClickTagId, setSingleClickTagId] = useState(null as string | null)
  const [onNextImageEvent, raiseOnNextImageEvent] = useEvent(null)
  const [onPrevImageEvent, raiseOnPrevImageEvent] = useEvent(null)
  const [_, raiseReloadImageEvent] = useRecoilEvent(reloadImagesEventAtom, null)

  useEffect(() => {
    setSelectedImageIds([])
    setSearchTags([])
    resetTagList()
    sendIpcGetAllTags(props.workspaceId, setTagAllList)
  }, [props.workspaceId])

  useEffect(() => {
    setSearchTags([])
  }, [props.uncategorized])

  useEffect(() => {
    const tagId = props.singleTagClickEvent.data
    setSingleClickTagId(tagId)
  }, [props.singleTagClickEvent])

  useEffect(() => {
    setSearchTags(state => {
      const tagId = singleClickTagId
      if (!tagId) return state
      return tagAllListState.filter((tag: any) => tagId == tag.tagId)
    })

    setSingleClickTagId(null)
  }, [singleClickTagId])

  useEffect(() => {
    if (showSearchPanel) {
      document.addEventListener('click', e => {
        const elm = e.target as HTMLElement | null
        if (!elm?.closest('#search-panel-id') && !elm?.closest('#search-bar-id')) {
          setShowSearchPanel(false)
        }
      })
    }
  }, [showSearchPanel])

  useEffect(() => {
    setSearchTags(state => {
      const tagIds = state.map(s => s.tagId)
      return tagAllListState.filter((tag: any) => tagIds.includes(tag.tagId))
    })
  }, [tagAllListState])

  useEffect(() => {
    window.api.on(ImagesIpcId.ImageContextMenu.RELOAD_IMAGES, (_e, _arg) => {
      const reload = document.getElementById('browse-image-area-reload')
      if (reload) reload.click()
    })
  }, [])

  const onImageDoubleClick = (imageId: string) => {
    props.onModeChange(imageId)
  }

  const onChangeSelectedImages = (imageIds: string[]) => {
    setSelectedImageIds(imageIds)
  }

  const onReloadClick = () => {
    if (props.imageId) {
      // TODO: 画像表示のリロード
    } else {
      // 一覧表示のリロード
      raiseReloadImageEvent(null)
    }
  }

  const searchBarClick = () => {
    setShowSearchPanel(true)
  }

  const onSearchPanelTagAddClick = (tagId: string | null, _tagName: string) => {
    if (!tagId) return

    const clickTags = tagAllListState.filter((tag: any) => tag.tagId == tagId)
    if (clickTags.length == 0) return
    const clickTag = clickTags[0]
    setSearchTags(state => [...state, clickTag])
  }

  const onSearchPanelTagDeleteClick = (tagId: string) => {
    setSearchTags(state => state.filter(tag => tag.tagId != tagId))
  }

  const toggleSearchType = (_tagId: string | null, _tagName: string) => {
    setSearchType(type => (type == 'and' ? 'or' : 'and'))
  }

  const clearSearchTags = () => {
    setSearchTags([])
  }

  const dsb_split_bar = useRef<HTMLDivElement>(null)
  const dsb_right = useRef<HTMLDivElement>(null)
  useDraggableSplitBar(props.dsb_ref, dsb_split_bar, dsb_right)

  if (!props.display) return <></>

  return (
    <>
      <section id="browse-image-area" className="browse-image-area" ref={props.dsb_ref}>
        <div className="main-header-area">
          <div className="prev" onClick={props.onPrevClick}>
            <FontAwesomeIcon icon={faArrowLeft} />
          </div>
          <div id="browse-image-area-reload" className="reload" onClick={onReloadClick}>
            <FontAwesomeIcon icon={faRotateRight} />
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
            {searchTags.map(t => {
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
              )
            })}
          </div>
          <div className="control-panel">
            <div className="back-foward">
              <FontAwesomeIcon
                icon={faChevronLeft}
                onClick={() => {
                  raiseOnPrevImageEvent(null)
                }}
              />
              <FontAwesomeIcon
                icon={faChevronRight}
                onClick={() => {
                  raiseOnNextImageEvent(null)
                }}
              />
            </div>
          </div>

          <SearchPanel
            id="search-panel-id"
            display={showSearchPanel}
            workspaceId={props.workspaceId}
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
          uncategorized={props.uncategorized}
        />

        {(() => {
          if (props.imageId) {
            return (
              <ImageView
                workspaceId={props.workspaceId}
                imageId={props.imageId}
                onNextImageEvent={onNextImageEvent}
                onPrevImageEvent={onPrevImageEvent}
              />
            )
          }
        })()}
      </section>

      <div id="after-browse-image-area" className="split-bar" ref={dsb_split_bar}></div>

      <ImageSideBar workspaceId={props.workspaceId} imageIds={selectedImageIds} dsb_ref={dsb_right} />
    </>
  )
}
