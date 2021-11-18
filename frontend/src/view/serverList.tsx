import React, { ReactDOM, useState, useEffect} from 'react';
import ReactModal from "react-modal";
import {
  IpcId as serverListIpcId,
  ServerInfo,
  CreateWorkspaceInfo,
  SelectWorkspace,
  ShowContextMenu,
  DeleteWorkspace,
} from "../ipc/serverList";
import CssConst from "./cssConst";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

export type ServerListProps = {
  serverList: ServerInfo[]
}

const reactModalStyle: ReactModal.Styles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: CssConst.MAIN_BACKGROUND_COLOR,
    borderColor: CssConst.EDGE_GRAY,
    color: CssConst.MAIN_FONT_COLOR,
  },
  overlay: {
    background: 'rgba(0, 0, 0, 0.5)'
  }
}

export const ServerList = () => {
  const [serverListState, setServerList] = useState([] as ServerInfo[]);
  const [isShowNewWorkspaceModalState, setIsShowNewWorkspaceModal] = useState(false);
  const [isShowDeleteWorkspaceModalState, setIsShowDeleteWorkspaceModal] = useState(false);
  const [workspaceInfoState, setWorkspaceInfo] = useState<CreateWorkspaceInfo>({name:'', dirName:'', dirPath:''});
  const [deleteWorkspaceState, setDeleteWorkspaceState] = useState<ServerInfo>(
    {workspaceId:'', name:'', iconImagePath:'', isAvailable: false, isSelected: false});

  useEffect(() => {
    window.api.send(serverListIpcId.FETCH_WORKSPACE_LIST);
  }, []);

  useEffect(() => {
    window.api.on(serverListIpcId.FETCH_WORKSPACE_LIST_REPLY, (_e, arg) => {
      const serverList = JSON.parse(arg) as ServerInfo[]
      setServerList(serverList);
    });
  }, []);

  useEffect(() => {
    window.api.on(serverListIpcId.SHOW_DELETE_WORKSPACE_MODAL_REPLY, (_e, arg) => {
      const deleteWorkspace = JSON.parse(arg) as ServerInfo
      setDeleteWorkspaceState(deleteWorkspace)
      setIsShowDeleteWorkspaceModal(true)
    });
  }, []);

  const showContextMenu = (e:any) => {
    e.preventDefault()
    let msg = JSON.stringify({
      workspaceId: e.target.dataset.workspace_id
    } as ShowContextMenu)
    window.api.send(serverListIpcId.SHOW_CONTEXT_MENU, msg)
  }

  useEffect(() => {
    Array.from(document.getElementsByClassName('actually-workspace-icon')).forEach((target) => {
      target.addEventListener('contextmenu', showContextMenu)
    });

    return () => {
      Array.from(document.getElementsByClassName('actually-workspace-icon')).forEach((target) => {
        target.removeEventListener('contextmenu', showContextMenu)
      });
    }
  });

  const selectedClassName = (is_selected: boolean) => {
    return is_selected ? 'selected' : '';
  }

  const createNewServer = () => {
    window.api.send(serverListIpcId.CREATE_NEW_SERVER, JSON.stringify(workspaceInfoState));
    setWorkspaceInfo({name:'', dirName:'', dirPath:''})
  }

  const deleteWorkspace = (workspaceId: string) => {
    let msg = JSON.stringify({
      workspaceId: workspaceId
    } as DeleteWorkspace)
    window.api.send(serverListIpcId.DELETE_WORKSPACE, msg)
  }

  const inputNameOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setWorkspaceInfo({...workspaceInfoState, name: event.target.value})
  }

  const inputDirNameOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setWorkspaceInfo({...workspaceInfoState, dirName: event.target.value})
  }

  const workspaceIconClick = (e:any) => {
    let sw: SelectWorkspace = { workspaceId: e.target.dataset.workspace_id }
    window.api.send(serverListIpcId.SELECT_WORKSPACE, JSON.stringify(sw));
  }

  const selectDirDialog = () => {
    window.api.send(serverListIpcId.SELECT_NEW_WORKSPACE_DIR);
    window.api.on(serverListIpcId.SELECT_NEW_WORKSPACE_DIR_REPLY, (_e, arg) => {
      setWorkspaceInfo({...workspaceInfoState, dirPath: arg[0]})
    });
  }

  return (
    <section id="server-list" className="server-list">
      {
        serverListState.map((s) => {
          return (
            <img
              className={`server-icon actually-workspace-icon ${selectedClassName(s.isSelected)}`} 
              src={s.iconImagePath}
              data-workspace_id={s.workspaceId}
              onClick={workspaceIconClick}>
            </img>
          );
        })
      }

      <div className="server-icon" onClick={ () => { setIsShowNewWorkspaceModal(true) } }>
        <FontAwesomeIcon icon={faPlus} />
      </div>

      {/* TODO: modalを共通化する */}
      <ReactModal
        isOpen={isShowNewWorkspaceModalState}
        onRequestClose={ () => { setIsShowNewWorkspaceModal(false) } }
        style={reactModalStyle}
      >
        <form className="modal-form" onSubmit={ () => { setIsShowNewWorkspaceModal(false) } }>
          <FontAwesomeIcon icon={faTimes} className="close-button" onClick={ () => { setIsShowNewWorkspaceModal(false) } } />
          <div className="title">ワークスペース新規作成</div>
          <div className="input-block">
            <label className="label-name">ワークスペース名
              <div>
                <input type="text" className="text-box" value={workspaceInfoState.name} onChange={inputNameOnChange}></input>
              </div>
            </label>
          </div>
          <div className="input-block">
            <label className="label-name">ワークスペースフォルダ名
              <div>
                <input type="text" className="text-box" value={workspaceInfoState.dirName} onChange={inputDirNameOnChange}></input>
              </div>
            </label>
          </div>
          <div className="show-block">
            <label className="label-name">ワークスペースを作成するフォルダ</label>
            <div>{workspaceInfoState.dirPath}</div>
            <button type="button" className="button" onClick={selectDirDialog}>フォルダ選択</button>
          </div>
          <div className="form-buttons">
            <button type="submit" className="button" onClick={createNewServer}>作成</button>
          </div>
        </form>
      </ReactModal>

      <ReactModal
        isOpen={isShowDeleteWorkspaceModalState}
        onRequestClose={ () => { setIsShowDeleteWorkspaceModal(false) } }
        style={reactModalStyle}
      >
        <form className="modal-form" onSubmit={ ()=>{setIsShowDeleteWorkspaceModal(false)} }>
          <FontAwesomeIcon icon={faTimes} className="close-button" onClick={ () => { setIsShowDeleteWorkspaceModal(false) } } />
          <div className="title">ワークスペースを削除してもよろしいですか？</div>
          <div className="content">
            ※uzumeからは削除されますが、ワークスペースフォルダは削除されません。
          </div>
          <div className="show-block">
            <label className="label-name">ワークスペースID</label>
            <div className="show-value">{deleteWorkspaceState.workspaceId}</div>
          </div>
          <div className="show-block">
            <label className="label-name">ワークスペース名</label>
            <div className="show-value">{deleteWorkspaceState.name}</div>
          </div>
          <div className="form-buttons">
            <button type="submit" className="button" onClick={ () => { setIsShowDeleteWorkspaceModal(false) } }>キャンセル</button>
            <button type="submit" className="button" onClick={ () => { deleteWorkspace(deleteWorkspaceState.workspaceId) } }>削除</button>
          </div>
        </form>
      </ReactModal>
    </section>
  );
}