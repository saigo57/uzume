import React from 'react';
import './SideTagBox.scss';

import { SideBarTitle } from '../../Atoms/SideBarTitle/SideBarTitle';
import { SearchBar, SearchBarProps } from '../../Atoms/SearchBar/SearchBar';
import { Tag } from '../../Atoms/Tag/Tag';

const SideBarTitleProps = {
    Title : "Tag"
}

const SearchBarPropsEnt : SearchBarProps = {
    BarType : "Short"
}

const TagProps = [
    {TagName:"にじさんじ"}
    ,{TagName:"1期生"}
    ,{TagName:"月ノ美兎"}
    ,{TagName:"スノー・ホワイト・パラダイス・エルサント・フロウ・ワスレナ・ピュア・プリンセス・リーヴル・ラブ・ハイデルン・ドコドコ・ヤッタゼ・ヴァルキュリア・パッション・アールヴ・ノエル・チャコボシ・エルアリア・フロージア・メイドイン・ブルーム・エル"}
    ,{TagName:"樋口楓"}
    ,{TagName:"静凛"}
    ,{TagName:"渋谷ハジメ"}
    ,{TagName:"鈴谷アキ"}
    ,{TagName:"モイラ"}
]

export const SideBarBox:React.VFC = () =>
{
    return (
        <>
        <SideBarTitle {...SideBarTitleProps}/>
        <div className="tag-area">
            <SearchBar {...SearchBarPropsEnt}/>
            <ul className="tagged-area">
                {TagProps.map((data)=>{return (<Tag {...data} />)})}
            </ul>
        </div>
        </>
    );
}