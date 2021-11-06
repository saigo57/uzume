import React from 'react';
import './Icon.scss';

export type IconProps = {
    IconPath: string,
    isSelected: boolean
};

export const Icon:React.VFC<IconProps> = (props: IconProps) =>
{
    return (
        <img
            className={"server-icon" + (props.isSelected?" selected":"")}
            src={props.IconPath}
            alt=""
        >
        </img>
    );
}