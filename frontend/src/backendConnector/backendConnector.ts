import BCWorkspace from './workspace';

export default class BackendConnector {
  static Workspace = BCWorkspace
  
  static workspaceList: { [key: string]: BCWorkspace; } = {}

  static workspace(workspaceId: string, callback: (workspace: BCWorkspace) => void) {
    if ( workspaceId in this.workspaceList ) {
      // TODO:tokenが切れてたときの処理
      callback(this.workspaceList[workspaceId])
    } else {
      BCWorkspace.createInstance(workspaceId).then((ws) => {
        this.workspaceList[workspaceId] = ws
        callback(ws)
      });
    }
  }
};
