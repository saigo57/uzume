import React from 'react';
import './SearchBar.scss';

export type LongOrShort = 'Long' | 'Short';

export type SearchBarProps = {
    BarType : LongOrShort
}

export const SearchBar:React.VFC<SearchBarProps> = (SearchBarProps) =>
{
    return(
        <div className= {(SearchBarProps.BarType==='Long')?'search-bar':'tag-search'}>
        </div>
    )
}