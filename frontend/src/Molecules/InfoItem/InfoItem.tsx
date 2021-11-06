import React from 'react';
import './InfoItem.scss';

import { Label } from '../../Atoms/Label/Label';
import { TextBox } from '../../Atoms/TextBox/TextBox';

type InfoItemProps = {
    LabelProps : {
        LabelValue: string
    }
}

export const InfoItem:React.VFC<InfoItemProps> = (InfoItemProps) => {
    return (
        <li className="info-item">
            <Label {...InfoItemProps.LabelProps}/>
            <TextBox />
        </li>
    );
}