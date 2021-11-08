import React, { useState, useEffect} from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

import { Tag } from "../component/atmos/tag";

export function ImageSideBar() {
  const [tagListState, setTagList] = useState([
    'にじさんじ',
    '1期生',
    '月ノ美兎',
    'スノー・ホワイト・パラダイス・エルサント・フロウ・ワスレナ・ピュア・プリンセス・リーヴル・ラブ・ハイデルン・ドコドコ・ヤッタゼ・ヴァルキュリア・パッション・アールヴ・ノエル・チャコボシ・エルアリア・フロージア・メイドイン・ブルーム・エル',
    '樋口楓',
    '静凛',
    '渋谷ハジメ',
    '鈴谷アキ',
    'モイラ',
    '勇気ちひろ',
  ]);

  return (
    <section id="image-side-bar" className="image-side-bar">
      <div className="side-bar-title"><div className="side-bar-title-text">Tag</div></div>
      <div className="tag-area">
        <div className="tag-search"></div>
        <div className="tagged-area">
          { tagListState.map((t) => { return (<Tag tagName={t}/>) }) }
        </div>
      </div>
      <div className="side-bar-title"><div className="side-bar-title-text">Info</div></div>
      <ul className="info-area">
        <li className="info-item">
          <div className="info-title">メモ</div>
          <textarea name="memo" className="info-body editable memo" value="画像についてのメモを記述する。編集はreactのstateを介して行う必要があるよう。" />
        </li> 
        <li className="info-item">
          <div className="info-title">作者</div>
          <input type="text" name="author" className="info-body editable" value="ジャムおじさん" />
        </li>
        <div className="info-item-block-separator"></div>
        <li className="info-item">
          <div className="info-title">ファイル名</div>
          <div className="info-body freezed">IMG_4261</div>
        </li>
        <li className="info-item">
          <div className="info-title">UUID</div>
          <div className="info-body freezed">ae8fcbac-ca43-4d31-85d2-7b52a1094236</div>
        </li>
        <li className="info-item">
          <div className="info-title">形式</div>
          <div className="info-body freezed">PNG</div>
        </li>
        <li className="info-item">
          <div className="info-title">登録日</div>
          <div className="info-body freezed">2000/01/01 00:00:00</div>
        </li>
        <li className="info-item">
          <div className="info-title">解像度</div>
          <div className="info-body freezed">256 × 256</div>
        </li>
        <li className="info-item">
          <div className="info-title">容量</div>
          <div className="info-body freezed">2.43MB</div>
        </li>
      </ul>
    </section>
  );
}
