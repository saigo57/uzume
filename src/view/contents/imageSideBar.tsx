import React, { useState, useEffect } from 'react'
import { useRecoilState, useSetRecoilState } from 'recoil'
import { imageInfoListAtom } from '../recoil/imageListAtom'
import { tagListAtom } from '../recoil/tagListAtom'
import { useTags } from '../lib/tagCustomHooks'
import { IpcId as ImageIpcId, ImageInfo, RemoveTagFromImage } from '../../ipc/images'
import { TagInfo } from '../../ipc/tags'
import { Tag } from '../component/atmos/tag'
import { TagCtrlPanel } from '../component/organisms/tagCtrlPanel'
import { sendIpcGetAllTags } from '../commonIpc'

type ImageSideBarProps = {
  workspaceId: string
  imageIds: string[]
  dsb_ref: React.RefObject<HTMLDivElement>
}

export const ImageSideBar: React.VFC<ImageSideBarProps> = props => {
  const setTagAllList = useSetRecoilState(tagListAtom)
  const [imageInfoList, setImageInfoList] = useRecoilState(imageInfoListAtom)

  const [isShowTagCtrlPanel, setIsShowTagCtrlPanel] = useState(false)
  const [tagListState, _showingTagAllListState, _resetTagList, _selectingMenu, _selectMenu] = useTags(props.workspaceId)

  useEffect(() => {
    if (props.imageIds.length == 0) setIsShowTagCtrlPanel(false)
  }, [props.imageIds])

  useEffect(() => {
    sendIpcGetAllTags(props.workspaceId, setTagAllList)
  }, [props.workspaceId])

  const onTagAreaClick = () => {
    setIsShowTagCtrlPanel(prev => !prev && props.imageIds.length > 0)
  }

  const linkedTag = () => {
    // 複数の画像を選択しているときは、共通しているタグのみ表示する
    const tagCount: { [key: string]: number } = {}
    let allImageCount = 0
    if (!props.imageIds) return []

    const imageInfoMap: { [key: string]: ImageInfo } = {}
    imageInfoList.forEach(imageInfo => {
      imageInfoMap[imageInfo.image_id] = imageInfo
    })

    // タグが何枚の画像に付与されているかをカウントする
    props.imageIds.forEach(image_id => {
      const imageInfo = imageInfoMap[image_id]
      allImageCount++
      if (imageInfo && imageInfo.tags) {
        imageInfo.tags.forEach(tag => {
          if (!tagCount[tag]) tagCount[tag] = 0
          tagCount[tag]++
        })
      }
    })

    const linkedTags: TagInfo[] = []
    tagListState.forEach(t => {
      // タグのカウントと画像の枚数と同じ = すべての画像に付与されている
      if (tagCount[t.tagId] == allImageCount) linkedTags.push(t)
    })
    return linkedTags
  }

  const removeTag = (tagId: string) => {
    const req: RemoveTagFromImage = {
      workspaceId: props.workspaceId,
      imageIds: props.imageIds,
      tagId: tagId,
    }
    window.api.invoke(ImageIpcId.Invoke.REMOVE_TAG, JSON.stringify(req)).then(arg => {
      const imageInfoList = JSON.parse(arg) as ImageInfo[]
      setImageInfoList(imageInfoList)
    })
  }

  const linkedTagList = linkedTag()
  let showImageInfo = {
    image_id: '',
    file_name: '',
    ext: '',
    memo: '',
    author: '',
    created_at: '',
  } as ImageInfo
  if (imageInfoList.length == 1) showImageInfo = imageInfoList[0]

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    const d = new Date(Date.parse(dateStr))
    const formatted_date =
      d.getFullYear() +
      '/' +
      (d.getMonth() + 1) +
      '/' +
      d.getDate() +
      ' ' +
      d.getHours() +
      ':' +
      d.getMinutes() +
      '.' +
      d.getSeconds()
    return formatted_date
  }

  return (
    <>
      <section id="image-side-bar" className="image-side-bar" ref={props.dsb_ref}>
        <div className="side-bar-title">
          <div className="side-bar-title-text">Tag</div>
        </div>
        <div className="tag-area" onClick={onTagAreaClick}>
          <div className="tagged-area">
            {linkedTagList.map(t => {
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
            })}
          </div>
        </div>
        <div className="side-bar-title">
          <div className="side-bar-title-text">Info</div>
        </div>
        <ul className="info-area">
          {/* <li className="info-item">
            <div className="info-title">メモ</div>
            <textarea name="memo" className="info-body editable memo" value="画像についてのメモを記述する。編集はreactのstateを介して行う必要があるよう。" />
          </li>
          <li className="info-item">
            <div className="info-title">作者</div>
            <input type="text" name="author" className="info-body editable" value="ジャムおじさん" />
          </li>
          <div className="info-item-block-separator"></div> */}
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
            <div className="info-body freezed">{formatDate(showImageInfo.created_at)}</div>
          </li>
          <li className="info-item">
            <div className="info-title">解像度</div>
            <div className="info-body freezed">
              {showImageInfo.width} {showImageInfo.width ? 'x' : ''} {showImageInfo.height}
            </div>
          </li>
          {/* <li className="info-item">
            <div className="info-title">容量</div>
            <div className="info-body freezed">2.43MB</div>
          </li> */}
        </ul>
      </section>

      <TagCtrlPanel
        workspaceId={props.workspaceId}
        display={isShowTagCtrlPanel}
        imageIds={props.imageIds}
        alreadyLinkedTag={linkedTagList}
        onRemoveTag={removeTag}
        onClose={() => {
          setIsShowTagCtrlPanel(false)
        }}
      />
    </>
  )
}
