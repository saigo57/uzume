import React, { useState, useEffect } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import { workspaceIdAtom } from './recoil/workspaceAtom'
import { BrowseImage } from './contents/browseImage'
import { TagManage } from './contents/tagManage'
import { MenuMode, menuModeAtom } from './recoil/menuModeAtom'

type contentsAreaProps = {
  dsb_ref: React.RefObject<HTMLDivElement>
}

export const ContentsArea: React.VFC<contentsAreaProps> = props => {
  const workspaceId = useRecoilValue(workspaceIdAtom)
  const [showAImageState, setShowAImage] = useState(null as string | null)
  const [currMode, _] = useRecoilState(menuModeAtom)

  useEffect(() => {
    setShowAImage(null)
  }, [workspaceId, currMode])

  const onBrowseImageModeChange = (imageId: string | null) => {
    setShowAImage(imageId)
  }

  const onPrevClick = () => {
    setShowAImage(null)
  }

  return (
    <>
      {(() => {
        return currMode == MenuMode.TAG_MANAGE ? <TagManage dsb_ref={props.dsb_ref} /> : <></>
      })()}

      {/* tag_manage表示時にレンダリングしない場合、stateが消えてしまうのでcomponent内で非表示にすることでstateを保持するようにする */}
      <BrowseImage
        display={currMode == MenuMode.HOME || currMode == MenuMode.UNCATEGORIZED}
        imageId={showAImageState}
        onModeChange={onBrowseImageModeChange}
        onPrevClick={onPrevClick}
        dsb_ref={props.dsb_ref}
      />
    </>
  )
}
