import React, { useState, useEffect} from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";

export function ImageIndexView() {
  const [thumbnailsState, setServerList] = useState(
    new Array(30).fill("../src/contents/img/design-server-icon.jpg")
  );

  return (
    <div className="thumbnail-area">
      {
        thumbnailsState.map((t) => {
          return (
            <div className="thumbnail">
              <img src={t}></img>
              <div className="original-size-icon"><FontAwesomeIcon icon={faBars} /></div>
            </div>
          )
        })
      }
    </div>
  );
}
