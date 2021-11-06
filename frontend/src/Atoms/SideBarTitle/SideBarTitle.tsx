import React from 'react';
import './SideBarTitle.scss';

export type SideBarTitleProps = {
    Title : string
}

export const SideBarTitle:React.VFC<SideBarTitleProps> = (SideBarTitleProps) => 
{
    return (
        <div className="side-bar-title">
            <div className="side-bar-title-text">
                {SideBarTitleProps.Title}
            </div>
        </div>
    )
}