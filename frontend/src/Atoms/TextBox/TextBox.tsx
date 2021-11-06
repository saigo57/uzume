import React from 'react';
import './TextBox.scss';

export const TextBox:React.VFC = () =>
{
    return (
        <input type="text" name="author" className="info-body editable" />
    )
}