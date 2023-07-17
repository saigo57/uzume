import React from 'react'
import { useRecoilValue } from 'recoil'
import { workspaceIdAtom } from '../../recoil/workspaceAtom'
import { useDrag } from 'react-dnd'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { ShowContextMenu } from '../../../ipc/tags'
import { createOnContextMenu } from '../../lib/tagCustomHooks'

// TODO: CSS in JSに置き換えたい
import './tag.scss'

type TagProps = {
  tagId: string | null
  tagName: string
  favorite: boolean
  delete: boolean
  alreadyAdded: boolean
  onClick: ((tagId: string | null, tagName: string) => void) | null
  onDeleteClick: ((tagId: string) => void) | null
}

export const Tag: React.FC<TagProps> = props => {
  const workspaceId = useRecoilValue(workspaceIdAtom)
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const [{ isDragging }, dragRef] = useDrag({
    /* eslint-enable @typescript-eslint/no-unused-vars */
    type: 'Item',
    item: { tagId: props.tagId },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const onTagClick = (e: any) => {
    e.stopPropagation()
    e.preventDefault()

    if (props.alreadyAdded) {
      if (props.onDeleteClick && props.tagId) props.onDeleteClick(props.tagId)
    } else {
      if (props.onClick) props.onClick(props.tagId, props.tagName)
    }
  }

  const onDeleteIconClick = (e: any) => {
    e.stopPropagation()
    e.preventDefault()
    if (props.onDeleteClick && props.tagId) props.onDeleteClick(props.tagId)
  }

  const showContextMenu = {
    workspaceId: workspaceId,
    tagId: props.tagId,
    tagName: props.tagName,
    currFavorite: props.favorite,
  } as ShowContextMenu

  return (
    <div
      className={`tag ${props.delete ? 'disp-delete' : ''} ${props.alreadyAdded ? 'added' : ''}`}
      onClick={onTagClick}
      onContextMenu={createOnContextMenu(showContextMenu)}
      ref={dragRef}
    >
      <div className="tag-text">{props.tagName}</div>
      {(() => {
        if (props.delete) {
          return <FontAwesomeIcon icon={faTimes} onClick={onDeleteIconClick} />
        }
      })()}
    </div>
  )
}
