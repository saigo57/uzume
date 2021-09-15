import React from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { faHome } from "@fortawesome/free-solid-svg-icons";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { faStepForward } from "@fortawesome/free-solid-svg-icons";
import { faStepBackward } from "@fortawesome/free-solid-svg-icons";
import { faCircle } from "@fortawesome/free-regular-svg-icons";

export default class DesignApp extends React.Component {
  render() {
    return (
      <div className="container">
        <section id="server-list" className="server-list">
          <img className="server-icon" src="../src/design/design-server-icon.jpg"></img>
          <img className="server-icon selected" src="../src/design/design-server-icon.jpg"></img>
          <img className="server-icon" src="../src/design/design-server-icon.jpg"></img>
          <img className="server-icon" src="../src/design/design-server-icon.jpg"></img>
          <img className="server-icon" src="../src/design/design-server-icon.jpg"></img>
          <div className="server-icon"><FontAwesomeIcon icon={faPlus} /></div>
        </section>

        <section id="main-menu" className="main-menu">
          <h1 className="menu-title clickable">
            <FontAwesomeIcon icon={faHome} /><div className="menu-title-text">Home</div>
          </h1>
          <h1 className="menu-title">
            <FontAwesomeIcon icon={faStar} /><div className="menu-title-text">Favorite Tags</div>
          </h1>
          <ul>
            <li className="tag-item"><FontAwesomeIcon icon={faCircle} />タグ1</li>
            <li className="tag-item"><FontAwesomeIcon icon={faCircle} />タグ2</li>
            <li className="tag-item"><FontAwesomeIcon icon={faCircle} />タグ3</li>
            <li className="tag-item"><FontAwesomeIcon icon={faCircle} />タグ4</li>
            <li className="tag-item"><FontAwesomeIcon icon={faCircle} />タグ5</li>
            <li className="tag-item"><FontAwesomeIcon icon={faCircle} />タグ6</li>
            <li className="tag-item"><FontAwesomeIcon icon={faCircle} />タグ7</li>
          </ul>
        </section>

        <div id="before-main" className="split-bar"></div>

        <section id="main" className="main">
          <div className="main-header-area">
            <div className="search-bar"></div>
            <div className="control-panel">
              <div className="back-foward">
                <FontAwesomeIcon icon={faStepBackward} />
                <FontAwesomeIcon icon={faStepForward} />
              </div>
            </div>
          </div>
          <div className="thumbnail-area">
            <div className="thumbnail">
              <img src="../src/design/design-server-icon.jpg"></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
            <div className="thumbnail">
              <img src="../src/design/design-server-icon.jpg"></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
            <div className="thumbnail">
              <img src="../src/design/design-server-icon.jpg"></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
            <div className="thumbnail">
              <img src="../src/design/design-server-icon.jpg"></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
            <div className="thumbnail">
              <img src="../src/design/design-server-icon.jpg"></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
            <div className="thumbnail">
              <img src="../src/design/design-server-icon.jpg"></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
            <div className="thumbnail">
              <img src="../src/design/design-server-icon.jpg"></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
            <div className="thumbnail">
              <img src="../src/design/design-server-icon.jpg"></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
            <div className="thumbnail">
              <img src="../src/design/design-server-icon.jpg"></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
            <div className="thumbnail">
              <img src="../src/design/design-server-icon.jpg"></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
            <div className="thumbnail">
              <img src="../src/design/design-server-icon.jpg"></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
            <div className="thumbnail">
              <img src="../src/design/design-server-icon.jpg"></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
            <div className="thumbnail">
              <img src="../src/design/design-server-icon.jpg"></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
            <div className="thumbnail">
              <img src="../src/design/design-server-icon.jpg"></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
            <div className="thumbnail">
              <img src="../src/design/design-server-icon.jpg"></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
            <div className="thumbnail">
              <img src="../src/design/design-server-icon.jpg"></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
            <div className="thumbnail">
              <img src="../src/design/design-server-icon.jpg"></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
            <div className="thumbnail">
              <img src="../src/design/design-server-icon.jpg"></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
            <div className="thumbnail">
              <img src="../src/design/design-server-icon.jpg"></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
            <div className="thumbnail">
              <img src="../src/design/design-server-icon.jpg"></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
            <div className="thumbnail">
              <img src="../src/design/design-server-icon.jpg"></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
            <div className="thumbnail">
              <img src="../src/design/design-server-icon.jpg"></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
            <div className="thumbnail">
              <img src="../src/design/design-server-icon.jpg"></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
            <div className="thumbnail">
              <img src="../src/design/design-server-icon.jpg"></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
            <div className="thumbnail">
              <img src="../src/design/design-server-icon.jpg"></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
            <div className="thumbnail">
              <img src="../src/design/design-server-icon.jpg"></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
            <div className="thumbnail">
              <img src="../src/design/design-server-icon.jpg"></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
            <div className="thumbnail">
              <img src="../src/design/design-server-icon.jpg"></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
            <div className="thumbnail">
              <img src="../src/design/design-server-icon.jpg"></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
            <div className="thumbnail">
              <img src="../src/design/design-server-icon.jpg"></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
            <div className="thumbnail">
              <img src="../src/design/design-server-icon.jpg"></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
            <div className="thumbnail">
              <img src="../src/design/design-server-icon.jpg"></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
            <div className="thumbnail">
              <img src="../src/design/design-server-icon.jpg"></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
            <div className="thumbnail">
              <img src="../src/design/design-server-icon.jpg"></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
            <div className="thumbnail">
              <img src="../src/design/design-server-icon.jpg"></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
            <div className="thumbnail">
              <img src="../src/design/design-server-icon.jpg"></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
            <div className="thumbnail">
              <img src="../src/design/design-server-icon.jpg"></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
            <div className="thumbnail">
              <img src="../src/design/design-server-icon.jpg"></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
            <div className="thumbnail">
              <img src="../src/design/design-server-icon.jpg"></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
            <div className="thumbnail">
              <img src="../src/design/design-server-icon.jpg"></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
            <div className="thumbnail">
              <img src="../src/design/design-server-icon.jpg"></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
            <div className="thumbnail">
              <img src="../src/design/design-server-icon.jpg"></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
            <div className="thumbnail">
              <img src="../src/design/design-server-icon.jpg"></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
            <div className="thumbnail">
              <img src="../src/design/design-server-icon.jpg"></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
            <div className="thumbnail">
              <img src="../src/design/design-server-icon.jpg"></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
            <div className="thumbnail">
              <img src="../src/design/design-server-icon.jpg"></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
            <div className="thumbnail">
              <img src="../src/design/design-server-icon.jpg"></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
            <div className="thumbnail">
              <img src="../src/design/design-server-icon.jpg"></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
            <div className="thumbnail">
              <img src="../src/design/design-server-icon.jpg"></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
            <div className="thumbnail">
              <img src="../src/design/design-server-icon.jpg"></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
            <div className="thumbnail">
              <img src="../src/design/design-server-icon.jpg"></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
            <div className="thumbnail">
              <img src="../src/design/design-server-icon.jpg"></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
            <div className="thumbnail">
              <img src="../src/design/design-server-icon.jpg"></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
            <div className="thumbnail">
              <img src="../src/design/design-server-icon.jpg"></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
            <div className="thumbnail">
              <img src="../src/design/design-server-icon.jpg"></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
            <div className="thumbnail">
              <img src="../src/design/design-server-icon.jpg"></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
            <div className="thumbnail">
              <img src="../src/design/design-server-icon.jpg"></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
            <div className="thumbnail">
              <img src="../src/design/design-server-icon.jpg"></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
            <div className="thumbnail">
              <img src="../src/design/design-server-icon.jpg"></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
            <div className="thumbnail">
              <img src="../src/design/design-server-icon.jpg"></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
            <div className="thumbnail">
              <img src="../src/design/design-server-icon.jpg"></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
            <div className="thumbnail">
              <img src="../src/design/design-server-icon.jpg"></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
            <div className="thumbnail">
              <img src="../src/design/design-server-icon.jpg"></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
            <div className="thumbnail">
              <img src="../src/design/design-server-icon.jpg"></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
            <div className="thumbnail">
              <img src="../src/design/design-server-icon.jpg"></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
            <div className="thumbnail">
              <img src="../src/design/design-server-icon.jpg"></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
            <div className="thumbnail">
              <img src="../src/design/design-server-icon.jpg"></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
            <div className="thumbnail">
              <img src="../src/design/design-server-icon.jpg"></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
            <div className="thumbnail">
              <img src="../src/design/design-server-icon.jpg"></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
            <div className="thumbnail">
              <img src="../src/design/design-server-icon.jpg"></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
            <div className="thumbnail">
              <img src="../src/design/design-server-icon.jpg"></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
            <div className="thumbnail">
              <img src="../src/design/design-server-icon.jpg"></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
            <div className="thumbnail">
              <img src="../src/design/design-server-icon.jpg"></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
            <div className="thumbnail">
              <img src="../src/design/design-server-icon.jpg"></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
            <div className="thumbnail">
              <img src="../src/design/design-server-icon.jpg"></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
            <div className="thumbnail">
              <img src="../src/design/design-server-icon.jpg"></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
            <div className="thumbnail">
              <img src="../src/design/design-server-icon.jpg"></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
            <div className="thumbnail">
              <img src="../src/design/design-server-icon.jpg"></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
          </div>
        </section>

        <div id="after-main" className="split-bar"></div>

        <section id="side-bar" className="side-bar">
          <div className="side-bar-title"><div className="side-bar-title-text">Tag</div></div>
          <div className="tag-area">
            <div className="tag-search"></div>
            <ul className="tagged-area">
              <li className="tag"><div className="tag-text">にじさんじ</div><FontAwesomeIcon icon={faTimes} /></li>
              <li className="tag"><div className="tag-text">1期生</div><FontAwesomeIcon icon={faTimes} /></li>
              <li className="tag"><div className="tag-text">月ノ美兎</div><FontAwesomeIcon icon={faTimes} /></li>
              <li className="tag"><div className="tag-text">スノー・ホワイト・パラダイス・エルサント・フロウ・ワスレナ・ピュア・プリンセス・リーヴル・ラブ・ハイデルン・ドコドコ・ヤッタゼ・ヴァルキュリア・パッション・アールヴ・ノエル・チャコボシ・エルアリア・フロージア・メイドイン・ブルーム・エル</div><FontAwesomeIcon icon={faTimes} /></li>
              <li className="tag"><div className="tag-text">樋口楓</div><FontAwesomeIcon icon={faTimes} /></li>
              <li className="tag"><div className="tag-text">静凛</div><FontAwesomeIcon icon={faTimes} /></li>
              <li className="tag"><div className="tag-text">渋谷ハジメ</div><FontAwesomeIcon icon={faTimes} /></li>
              <li className="tag"><div className="tag-text">鈴谷アキ</div><FontAwesomeIcon icon={faTimes} /></li>
              <li className="tag"><div className="tag-text">モイラ</div><FontAwesomeIcon icon={faTimes} /></li>
            </ul>
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
        <section id="footer">
        </section>
      </div>
    );
  }
}
