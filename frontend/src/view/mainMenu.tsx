import React, { useState, useEffect} from 'react';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faStar, faQuestion, faTag, faFolder, faCaretRight, faCaretDown } from "@fortawesome/free-solid-svg-icons";
import { faCircle } from "@fortawesome/free-regular-svg-icons";
import { useTags } from './lib/tagCustomHooks';

type MainMenuProps = {
  workspaceId: string
  workspaceName: string
  currMode: string
  onAction: (action: string) => void
  onSingleTagClick: (tagId: string) => void
  dsb_ref: React.RefObject<HTMLElement>
};

export const MainMenu:React.VFC<MainMenuProps> = (props) => {
  const [FavoriteTagListState, setFavoriteTagList] = useState(['タグ1', 'タグ2', 'タグ3', 'タグ4']);
  const [tagGroupListState, tagAllListState, _showingTagAllListState, _resetTagList, _selectingMenu, _selectMenu] = useTags(props.workspaceId);
  const [isTagGroupOpen, setIsTagGroupOpen] = useState({} as { [key: string]: boolean });

  useEffect(() => {
    setIsTagGroupOpen({})
  }, [tagGroupListState]);

  const onHomeClick = () => {
    if ( props.onAction ) props.onAction('home_click');
  };

  const onUncategorizedClick = () => {
    if ( props.onAction ) props.onAction('uncategorized_click');
  };

  const onTagManageClick = () => {
    if ( props.onAction ) props.onAction('tag_manage_click');
  };

  const selectedClass = (menu: string): string => {
    return props.currMode == menu ? 'selected' : '';
  };

  const onTagGroupClick = (tagGroupId: string) => {
    setIsTagGroupOpen((state) => {
      var next_state = {...state}
      next_state[tagGroupId] = !next_state[tagGroupId]
      return next_state
    })
  }

  return (
    <section id="main-menu" className="main-menu" ref={props.dsb_ref}>
      <h1 className="menu-title">
        {props.workspaceName}
      </h1>
      <h1 className={`menu-title clickable ${selectedClass("home")}`} onClick={onHomeClick}>
        <FontAwesomeIcon icon={faHome} /><div className="menu-title-text">Home</div>
      </h1>
      <h1 className={`menu-title clickable ${selectedClass("uncategorized")}`} onClick={onUncategorizedClick}>
        <FontAwesomeIcon icon={faQuestion} /><div className="menu-title-text">未分類</div>
      </h1>
      <h1 className={`menu-title clickable ${selectedClass("tag_manage")}`} onClick={onTagManageClick}>
        <FontAwesomeIcon icon={faTag} /><div className="menu-title-text">タグ管理</div>
      </h1>
      <h1 className="menu-title">
        <FontAwesomeIcon icon={faStar} /><div className="menu-title-text">Favorite Tags</div>
      </h1>
      <ul>
        {
          FavoriteTagListState.map((tag) => {
            return <li className="tag-item"><FontAwesomeIcon icon={faCircle} />{tag}</li>
          }) 
        }
      </ul>
      <h1 className="menu-title">
        <FontAwesomeIcon icon={faFolder} /><div className="menu-title-text">タググループ</div>
      </h1>
      <ul>
        {
          tagGroupListState.map((tag_group) => {
            return (
              <>
                <li className="tag-group-item" onClick={ () => { onTagGroupClick(tag_group.tagGroupId) } } >
                  <FontAwesomeIcon icon={ isTagGroupOpen[tag_group.tagGroupId] ? faCaretDown : faCaretRight }/>
                  {tag_group.name}
                </li>
                {(() => {
                  // タグ
                  if ( isTagGroupOpen[tag_group.tagGroupId] ) {
                    return (
                      tagAllListState.map((tag) => {
                        if ( tag.tagGroupId != tag_group.tagGroupId ) return;
                        return <li className="tag-item" onClick={() => { props.onSingleTagClick(tag.tagId) }}><FontAwesomeIcon icon={faTag} />{tag.name}</li>
                      })
                    )
                  }
                })()}
              </>
            )
          })
        }
      </ul>
    </section>
  );
}
