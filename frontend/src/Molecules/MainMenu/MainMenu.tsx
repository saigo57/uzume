import React from 'react';
import './MainMenu.scss';

import {MenuItem, MenuItemChild} from '../../Atoms/MenuItem/MenuItem';
import {MenuItemProps, MenuItemChildProps} from '../../Atoms/MenuItem/MenuItem';


type MainMenuProps = {

    ParentItems: MenuItemProps[]
    ChildItems: MenuItemChildProps[]
}

export const MainMenu:React.VFC<MainMenuProps> = (MainMenuProps) => {
    
    return (
        <section id="main-menu" className="main-menu">
            {MainMenuProps.ParentItems.map((data) => {return <MenuItem {...data}/>})}
            {MainMenuProps.ChildItems.map((data) => {return <MenuItemChild {...data}/>})}
        </section>
    );
}