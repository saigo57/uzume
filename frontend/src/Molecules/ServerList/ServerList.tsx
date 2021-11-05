import React from 'react';
import './ServerList.scss';

import {Icon, IconProps} from '../../Atoms/Icon/Icon';

type ServerListProps = {
    IconItems : IconProps[]
}

export const ServerList:React.VFC<ServerListProps> = (ServerListProps) =>
{
    return (
        <section  id="server-list" className="server-list">
            {ServerListProps.IconItems.map((data) => {return <Icon {...data}/>})}
        </section>
    );
}