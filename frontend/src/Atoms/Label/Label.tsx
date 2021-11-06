import React from 'react';
import './Label.scss';

type LabelProps = {
    LabelValue: string
};

export const Label:React.VFC<LabelProps> = (props: LabelProps) =>
{
    return (
        <div className="info-title">
            {props.LabelValue}
        </div>
    )
}