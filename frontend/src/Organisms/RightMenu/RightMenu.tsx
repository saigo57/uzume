import React from 'react';
import './RightMenu.scss';

import { SideBarBox } from '../../Molecules/SideTagBox/SideTagBox';
import { SideInfoBox } from '../../Molecules/SideInfoBox/SideInfoBox';

export const RightMenu:React.VFC = () => {
    return (
        <section id="side-bar" className="side-bar">
            <SideBarBox />
            <SideInfoBox />
        </section>
    );
}