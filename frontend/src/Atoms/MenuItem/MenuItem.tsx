import React from 'react';
import './MenuItem.scss';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

export type MenuItemProps = {
    ItemName: string,
    ItemIcon: IconDefinition,
    IsSelectable: boolean,
    IsSelected: boolean
};

export const MenuItem:React.VFC<MenuItemProps> = (props: MenuItemProps) =>
{
    return (
        <h1 className={"menu-title" + (props.IsSelectable?" clickable":"")}>
            <FontAwesomeIcon icon={props.ItemIcon} />
            <div className="menu-title-text">{props.ItemName}</div>
        </h1>
    );
}

export type MenuItemChildProps = {
    ItemName: string,
    ItemIcon: IconDefinition,
    IsSelectable: boolean,
    IsSelected: boolean
};

export const MenuItemChild:React.VFC<MenuItemChildProps> = (props: MenuItemChildProps) =>
{
    return (
        <li className="tag-item"><FontAwesomeIcon icon={props.ItemIcon} />{props.ItemName}</li>
    );
}