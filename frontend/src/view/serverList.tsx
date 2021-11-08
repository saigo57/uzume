import React, { useState, useEffect} from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { ServerInfo } from "../ipcFormat/serverList";

export type ServerListProps = {
  serverList: ServerInfo[]
}

export const ServerList = () => {
  const [serverListState, setServerList] = useState([] as ServerInfo[]);

  useEffect(() => {
    window.api.send('fetch-server-list');
  }, []);

  useEffect(() => {
    window.api.on('fetch-server-list-reply', (_e, arg) => {
      const serverList = JSON.parse(arg) as ServerInfo[]
      setServerList(serverList);
    });
  }, []);

  const selectedClassName = (is_selected: boolean) => {
    return is_selected ? 'selected' : '';
  }

  const createNewServer = () => {
    window.api.send('create-new-server');
  }

  return (
    <section id="server-list" className="server-list">
      {
       serverListState.map((s) => {
          return (
            <img className={`server-icon ${selectedClassName(s.isSelected)}`} 
              src={s.imagePath}>
            </img>
          );
        })
      }
      <div className="server-icon" onClick={createNewServer}>
        <FontAwesomeIcon icon={faPlus} />
      </div>
    </section>
  );
}
