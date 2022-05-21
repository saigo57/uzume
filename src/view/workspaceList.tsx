import React, { ReactDOM, useState, useEffect} from 'react';
import ReactModal from "react-modal";
import {
  IpcId as workspaceListIpcId,
  WorkspaceInfo,
  CreateWorkspaceInfo,
  SelectWorkspace,
  ShowContextMenu,
  DeleteWorkspace,
  AddWorkspaceInfo,
  FetchWorkspaceIcon,
  IconImageData,
  SetWorkspaceIcon,
  UpdateWorkspaceName,
} from "../ipc/workspaceList";
import CssConst from "./cssConst";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTimes, faUnlink, faFolder } from "@fortawesome/free-solid-svg-icons";

export type WorkspaceListProps = {
  workspaceList: WorkspaceInfo[]
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

export const WorkspaceList = () => {
  const DEFAULT_ICON_PATH = '../src/contents/img/design-workspace-icon.png';
  const [workspaceListState, setWorkspaceList] = useState([] as WorkspaceInfo[]);
  const [isShowNewWorkspaceModalState, setIsShowNewWorkspaceModal] = useState(false);
  const [isShowAddWorkspaceModalState, setIsShowAddWorkspaceModal] = useState(false);
  const [isShowDeleteWorkspaceModalState, setIsShowDeleteWorkspaceModal] = useState(false);
  const [isShowSetIconModalState, setIsShowSetIconModalState] = useState(false);
  const [isShowUpdateWorkspaceNameModalState, setIsShowUpdateWorkspaceNameModalState] = useState(false);
  const [workspaceInfoState, setWorkspaceInfo] = useState<CreateWorkspaceInfo>({dirName:'', dirPath:''});
  const [deleteWorkspaceState, setDeleteWorkspaceState] = useState<WorkspaceInfo>(
    {workspaceId:'', name:'', isAvailable: false, isSelected: false});
  const [workspaceIconState, setWorkspaceIconState] = useState<WorkspaceInfo>(
    {workspaceId:'', name:'', isAvailable: false, isSelected: false});
  const [updateWorkspaceNameState, setUpdateWorkspaceNameState] = useState<WorkspaceInfo>(
    {workspaceId:'', name:'', isAvailable: false, isSelected: false});
  const [addWorkspacePathState, setAddWorkspacePathState] = useState('');
  const [workspaceIconPathState, setWorkspaceIconPathState] = useState('');

  useEffect(() => {
    window.api.send(workspaceListIpcId.ToMainProc.FETCH_WORKSPACE_LIST);
  }, []);

  useEffect(() => {
    window.api.on(workspaceListIpcId.ToRenderer.FETCH_WORKSPACE_LIST, (_e, arg) => {
      const workspaceList = JSON.parse(arg) as WorkspaceInfo[]
      setWorkspaceList(workspaceList);
    });
  }, []);

  useEffect(() => {
    window.api.on(workspaceListIpcId.ToRenderer.SHOW_DELETE_WORKSPACE_MODAL, (_e, arg) => {
      const deleteWorkspace = JSON.parse(arg) as WorkspaceInfo
      setDeleteWorkspaceState(deleteWorkspace)
      setIsShowDeleteWorkspaceModal(true)
    });
  }, []);

  useEffect(() => {
    window.api.on(workspaceListIpcId.ToRenderer.SHOW_SET_ICON_MODAL, (_e, arg) => {
      const targetWorkspace = JSON.parse(arg) as WorkspaceInfo
      setWorkspaceIconState(targetWorkspace)
      setIsShowSetIconModalState(true)
    });
  }, []);

  useEffect(() => {
    window.api.on(workspaceListIpcId.ToRenderer.SHOW_UPDATE_WORKSPACE_NAME_MODAL, (_e, arg) => {
      const targetWorkspace = JSON.parse(arg) as WorkspaceInfo
      setUpdateWorkspaceNameState(targetWorkspace)
      setIsShowUpdateWorkspaceNameModalState(true)
    });
  }, []);

  useEffect(() => {
    window.api.on(workspaceListIpcId.ToRenderer.SELECT_SET_WORKSPACE_ICON, (_e, arg) => {
      setWorkspaceIconPathState(arg[0])
    });
  }, []);

  useEffect(() => {
    workspaceListState.forEach((workspace) => {
      let req = { workspaceId: workspace.workspaceId } as FetchWorkspaceIcon
      window.api.send(workspaceListIpcId.ToMainProc.FETCH_WORKSPACE_ICON, JSON.stringify(req));
    })
  }, [workspaceListState]);

  useEffect(() => {
    window.api.on(workspaceListIpcId.ToRenderer.FETCH_WORKSPACE_ICON, (_e, arg) => {
      const iconImageData = JSON.parse(arg) as IconImageData;
      let img: any = document.getElementById(`icon-image-${iconImageData.workspaceId}`);

      if ( img ) {
        if ( iconImageData.iconExists ) {
          img.src = "data:image;base64," + iconImageData.imageBase64;
        } else {
          img.src = DEFAULT_ICON_PATH;
        }
      }
    });
  }, []);

  const showContextMenu = (e:any) => {
    e.preventDefault()
    let msg = JSON.stringify({
      workspaceId: e.target.dataset.workspace_id,
      is_available: e.target.dataset.is_available === "true",
    } as ShowContextMenu)
    window.api.send(workspaceListIpcId.ToMainProc.SHOW_CONTEXT_MENU, msg)
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

  const availableClassName = (is_available: boolean) => {
    return is_available ? '' : 'not_available';
  }

  const createNewWorkspace = () => {
    window.api.send(workspaceListIpcId.ToMainProc.CREATE_NEW_WORKSPACE, JSON.stringify(workspaceInfoState));
    setWorkspaceInfo({dirName:'', dirPath:''})
  }

  const AddExistingWorkspace = () => {
    let req: AddWorkspaceInfo = {
      dirPath: addWorkspacePathState
    }
    window.api.send(workspaceListIpcId.ToMainProc.CREATE_ADD_WORKSPACE, JSON.stringify(req));
    setAddWorkspacePathState('')
  }

  const deleteWorkspace = (workspaceId: string) => {
    let msg = JSON.stringify({
      workspaceId: workspaceId
    } as DeleteWorkspace)
    window.api.send(workspaceListIpcId.ToMainProc.DELETE_WORKSPACE, msg)
  }

  const setWorkspaceIcon = (workspaceId: string) => {
    let msg = JSON.stringify({
      workspaceId: workspaceId,
      iconPath: workspaceIconPathState,
    } as SetWorkspaceIcon)
    window.api.send(workspaceListIpcId.ToMainProc.SET_WORKSPACE_ICON, msg)
  }

  const updateWorkspaceName = () => {
    let msg = JSON.stringify({
      workspaceId: updateWorkspaceNameState.workspaceId,
      name: updateWorkspaceNameState.name,
    } as UpdateWorkspaceName)
    window.api.send(workspaceListIpcId.ToMainProc.UPDATE_WORKSPACE_NAME, msg)
  }

  const inputDirNameOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setWorkspaceInfo({...workspaceInfoState, dirName: event.target.value})
  }

  const workspaceIconClick = (e:any) => {
    if ( e.target.dataset.is_available === "false" ) return;

    let sw: SelectWorkspace = { workspaceId: e.target.dataset.workspace_id }
    window.api.send(workspaceListIpcId.ToMainProc.SELECT_WORKSPACE, JSON.stringify(sw));
  }

  const selectNewWorkspaceDir = () => {
    window.api.send(workspaceListIpcId.ToMainProc.SELECT_NEW_WORKSPACE_DIR);
    window.api.on(workspaceListIpcId.ToRenderer.SELECT_NEW_WORKSPACE_DIR, (_e, arg) => {
      setWorkspaceInfo({...workspaceInfoState, dirPath: arg[0]})
    });
  }

  const selectAddWorkspaceDir = () => {
    window.api.send(workspaceListIpcId.ToMainProc.SELECT_ADD_WORKSPACE_DIR);
    window.api.on(workspaceListIpcId.ToRenderer.SELECT_ADD_WORKSPACE_DIR, (_e, arg) => {
      setAddWorkspacePathState(arg[0])
    });
  }

  const selectWorkspaceIcon = () => {
    window.api.send(workspaceListIpcId.ToMainProc.SELECT_SET_WORKSPACE_ICON);
  }

  const showAddWorkspaceModal = () => {
    setIsShowNewWorkspaceModal(false)
    setIsShowAddWorkspaceModal(true)
  }

  const updateWorkspaceNameOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUpdateWorkspaceNameState((state) => {
      return {...state, name: event.target.value}
    })
  }

  return (
    <section id="workspace-list" className="workspace-list">
      {
        workspaceListState.map((s) => {
          return (
            <div className={`workspace-icon ${selectedClassName(s.isSelected)} ${availableClassName(s.isAvailable)}`}>
              <img
                id={`icon-image-${s.workspaceId}`}
                className={`actually-workspace-icon`} 
                src={DEFAULT_ICON_PATH}
                data-workspace_id={s.workspaceId}
                data-is_available={s.isAvailable}
                onClick={workspaceIconClick}>
              </img>
              <div className="workspace-icon-unlink">
                <FontAwesomeIcon icon={faUnlink} />
              </div>
            </div>
          );
        })
      }

      <div id="workspace-icon-id" className="workspace-icon" onClick={ () => { setIsShowNewWorkspaceModal(true) } }>
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
            <label className="label-name">ワークスペース名</label>
            <input type="text" className="text-box" value={workspaceInfoState.dirName} onChange={inputDirNameOnChange}></input>
          </div>
          <div className="input-block">
            <label className="label-name">作成されるフォルダ</label>
            <input type="text" className="text-box" value={`${workspaceInfoState.dirName}.uzume`} readOnly></input>
          </div>
          <div className="show-block">
            <label className="label-name">ワークスペースを作成するフォルダ</label>
            <div className="input-dir-path">
              <input type="text" className="text-box" value={workspaceInfoState.dirPath} readOnly></input>
              <button type="button" className="button" onClick={selectNewWorkspaceDir}>
                <FontAwesomeIcon icon={faFolder}></FontAwesomeIcon>
              </button>
            </div>
          </div>
          <div className="form-buttons">
            <button type="submit" className="button" onClick={ () => { setIsShowNewWorkspaceModal(false) } }>キャンセル</button>
            <button type="submit" className="button" onClick={createNewWorkspace}>作成</button>
          </div>
          <div className="existing-workspace-link" onClick={showAddWorkspaceModal}>既存のワークスペースを追加する場合はこちら</div>
        </form>
      </ReactModal>

      <ReactModal
        isOpen={isShowAddWorkspaceModalState}
        onRequestClose={ () => { setIsShowAddWorkspaceModal(false) } }
        style={reactModalStyle}
      >
        <form className="modal-form" onSubmit={ () => { setIsShowAddWorkspaceModal(false) } }>
          <FontAwesomeIcon icon={faTimes} className="close-button" onClick={ () => { setIsShowAddWorkspaceModal(false) } } />
          <div className="title">ワークスペース追加</div>
          <div className="show-block">
            <label className="label-name">追加するワークスペースのフォルダ</label>
            <div className="input-dir-path">
              <input type="text" className="text-box" value={addWorkspacePathState} readOnly></input>
              <button type="button" className="button" onClick={selectAddWorkspaceDir}>
                <FontAwesomeIcon icon={faFolder}></FontAwesomeIcon>
              </button>
            </div>
          </div>
          <div className="form-buttons">
            <button type="submit" className="button" onClick={() => { setIsShowAddWorkspaceModal(false) }}>キャンセル</button>
            <button type="submit" className="button" onClick={AddExistingWorkspace}>追加</button>
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
            <input type="text" className="text-box" value={deleteWorkspaceState.workspaceId} readOnly></input>
          </div>
          <div className="show-block">
            <label className="label-name">ワークスペース名</label>
            <input type="text" className="text-box" value={deleteWorkspaceState.name} readOnly></input>
          </div>
          <div className="form-buttons">
            <button type="submit" className="button" onClick={ () => { setIsShowDeleteWorkspaceModal(false) } }>キャンセル</button>
            <button type="submit" className="button" onClick={ () => { deleteWorkspace(deleteWorkspaceState.workspaceId) } }>削除</button>
          </div>
        </form>
      </ReactModal>

      <ReactModal
        isOpen={isShowSetIconModalState}
        onRequestClose={ () => { setIsShowSetIconModalState(false) } }
        style={reactModalStyle}
      >
        <form className="modal-form" onSubmit={ () => { setIsShowSetIconModalState(false) } }>
          <FontAwesomeIcon icon={faTimes} className="close-button" onClick={ () => { setIsShowSetIconModalState(false) } } />
          <div className="title">{workspaceIconState.name} アイコン設定</div>
          <div className="show-block">
            <div>{workspaceIconPathState}</div>
            <button type="button" className="button" onClick={selectWorkspaceIcon}>画像選択</button>
          </div>
          <div className="form-buttons">
            <button type="submit" className="button" onClick={() => { setIsShowSetIconModalState(false) }}>キャンセル</button>
            <button type="submit" className="button" onClick={() => { setWorkspaceIcon(workspaceIconState.workspaceId) }}>設定</button>
          </div>
        </form>
      </ReactModal>

      <ReactModal
        isOpen={isShowUpdateWorkspaceNameModalState}
        onRequestClose={ () => { setIsShowUpdateWorkspaceNameModalState(false) } }
        style={reactModalStyle}
      >
        <form className="modal-form" onSubmit={ () => { setIsShowUpdateWorkspaceNameModalState(false) } }>
          <FontAwesomeIcon icon={faTimes} className="close-button" onClick={ () => { setIsShowUpdateWorkspaceNameModalState(false) } } />
          <div className="title">ワークスペース名変更</div>
          <div className="show-block">
            <label className="label-name">ワークスペース名</label>
            <input type="text" className="text-box" value={updateWorkspaceNameState.name} onChange={updateWorkspaceNameOnChange}></input>
          </div>
          <div className="form-buttons">
            <button type="submit" className="button" onClick={() => { setIsShowUpdateWorkspaceNameModalState(false) }}>キャンセル</button>
            <button type="submit" className="button" onClick={updateWorkspaceName}>変更</button>
          </div>
        </form>
      </ReactModal>
    </section>
  );
}
