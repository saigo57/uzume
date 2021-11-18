import React, { useState, useEffect} from 'react';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome } from "@fortawesome/free-solid-svg-icons";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { faCircle } from "@fortawesome/free-regular-svg-icons";

type MainMenuProps = {
  workspaceName: string
  onAction: (action: string) => void
};

export const MainMenu:React.VFC<MainMenuProps> = (props) => {
  const [FavoriteTagListState, setFavoriteTagList] = useState(['タグ1', 'タグ2', 'タグ3', 'タグ4']);

  const onHomeClick = () => {
    if ( props.onAction ) props.onAction('home_click');
  };

  return (
    <section id="main-menu" className="main-menu">
      <h1 className="menu-title">
        {props.workspaceName}
      </h1>
      <h1 className="menu-title clickable" onClick={onHomeClick}>
        <FontAwesomeIcon icon={faHome} /><div className="menu-title-text">Home</div>
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
    </section>
  );
}
