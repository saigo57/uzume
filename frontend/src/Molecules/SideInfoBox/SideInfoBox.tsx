import React from 'react';
import './SideInfoBox.scss';

import { SideBarTitle } from '../../Atoms/SideBarTitle/SideBarTitle';
import { InfoItem } from '../InfoItem/InfoItem';

const SideBarTitleProps = {
    Title : "Info"
}

const InfoItemProps = [
    {LabelProps:{LabelValue: "メモ"}},
    {LabelProps:{LabelValue: "作者"}},
    {LabelProps:{LabelValue: "ファイル名"}},
    {LabelProps:{LabelValue: "UUID"}},
    {LabelProps:{LabelValue: "形式"}},
    {LabelProps:{LabelValue: "登録日"}},
    {LabelProps:{LabelValue: "解像度"}},
    {LabelProps:{LabelValue: "容量"}},
];

export const SideInfoBox:React.VFC = () => {
    return (
        <>
        <SideBarTitle {...SideBarTitleProps}/>
        <ul className="info-area">
            {InfoItemProps.map((data)=>{return (<InfoItem {...data}/>);})}
        </ul>
        </>
    );
}