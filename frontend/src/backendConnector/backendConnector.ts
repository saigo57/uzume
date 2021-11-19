import BCWorkspace from './workspace';

export default class BackendConnector {
  static Workspace = BCWorkspace
  
  static workspaceList: { [key: string]: BCWorkspace; } = {}

  static workspace(workspaceId: string, callback: (workspace: BCWorkspace) => void) {

    // accessTokenがキャッシュされていたらそれを使う
    if ( workspaceId in this.workspaceList ) {
      let unauthorize = false;

      try {
        callback(this.workspaceList[workspaceId])
      } catch (e:any) {
        if ( e.status == 401 ) unauthorize = true;
      }

      // accessTokenがおかしかった場合はreturnせず再取得からやり直す
      if ( !unauthorize ) return;
    }

    // accessToken取得とcallback実行
    BCWorkspace.createInstance(workspaceId).then((ws) => {
      this.workspaceList[workspaceId] = ws
      callback(ws)
    });
  }
};
