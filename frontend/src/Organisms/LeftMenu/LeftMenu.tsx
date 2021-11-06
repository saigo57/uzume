import React from 'react';
import './LeftMenu.scss';

import {ServerList} from '../../Molecules/ServerList/ServerList';
import {MainMenu} from '../../Molecules/MainMenu/MainMenu';

import { faHome } from "@fortawesome/free-solid-svg-icons";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { faCircle } from "@fortawesome/free-regular-svg-icons";


const MainMenuProps = {
    ParentItems : [
    {
      ItemName: "Home",
      ItemIcon: faHome,
      IsSelectable: true,
      IsSelected: false
    },
    {
      ItemName: "Favorite Tags",
      ItemIcon: faStar,
      IsSelectable: false,
      IsSelected: false
    }
  ], 
    ChildItems : [
      {
        ItemName: "タグ1",
        ItemIcon: faCircle,
        IsSelectable: true,
        IsSelected: false
      }
      ,{
        ItemName: "タグ2",
        ItemIcon: faCircle,
        IsSelectable: true,
        IsSelected: false
      }
      ,{
        ItemName: "タグ3",
        ItemIcon: faCircle,
        IsSelectable: true,
        IsSelected: false
      }
      ,{
        ItemName: "タグ4",
        ItemIcon: faCircle,
        IsSelectable: true,
        IsSelected: false
      }
      ,{
        ItemName: "タグ5",
        ItemIcon: faCircle,
        IsSelectable: true,
        IsSelected: false
      }
    ]
};
  
  const ServerListProps = {
    IconItems : [
      {
        IconPath : "img/design-server-icon.jpg"
        , isSelected : false
      },
      {
        IconPath : "img/design-server-icon.jpg"
        , isSelected : false
      },
      {
        IconPath : "img/design-server-icon.jpg"
        , isSelected : false
      }
    ]
};

export const LeftMenu:React.VFC = () =>
{
    return (
        <>    
            <ServerList {...ServerListProps}/>
            <MainMenu {...MainMenuProps}/>
        </>
    );
}