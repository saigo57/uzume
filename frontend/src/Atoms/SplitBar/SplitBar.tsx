import React from 'react';
import './SplitBar.scss';

export type SplitBarProps = {
    Id : string
}

export const SplitBar:React.VFC<SplitBarProps> = (SplitBarProps) => {
  return (
    <div id={SplitBarProps.Id} className="split-bar"></div>
  )
}
