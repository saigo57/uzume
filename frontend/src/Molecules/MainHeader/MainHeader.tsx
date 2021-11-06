import React from 'react';
import './MainHeader.scss';

import { SearchBar, SearchBarProps } from '../../Atoms/SearchBar/SearchBar';
import { ControlPanel } from '../../Atoms/ControlPanel/ControlPanel';

const SrearchBarProps: SearchBarProps = {
    BarType: 'Long'
}

export const MainHeader:React.VFC = () => {
    return (
        <div className="main-header-area">
            <SearchBar {...SrearchBarProps}/>
            <ControlPanel />
        </div>
    )
}