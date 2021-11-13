import React, { useState, useEffect} from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStepForward } from "@fortawesome/free-solid-svg-icons";
import { faStepBackward } from "@fortawesome/free-solid-svg-icons";

import { ImageIndexView } from "./imageIndexView";
import { ImageSideBar } from "./imageSideBar";

export function BrowseImage() {
  return (
    <>
      <section id="browse-image-area" className="browse-image-area">
        <div className="main-header-area">
          <div className="search-bar"></div>
          <div className="control-panel">
            <div className="back-foward">
              <FontAwesomeIcon icon={faStepBackward} />
              <FontAwesomeIcon icon={faStepForward} />
            </div>
          </div>
        </div>

        {/* ここでサムネ表示と原寸大表示を切り替える */}
        <ImageIndexView />
      </section>

      <div id="after-browse-image-area" className="split-bar"></div>

      <ImageSideBar />
    </>
  );
}
