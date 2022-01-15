// BC: BackendConnector
import BCWorkspace from './workspace';

export default class BackendConnector {
  static Workspace = BCWorkspace
  
  static workspaceList: { [key: string]: BCWorkspace; } = {}
  static onFailAuthorization: ((err: any) => void) | null = null
  private static backendUrl: string | null = null

  static setBackendUrl(url: string) {
    if ( url.slice(-1) == '/' ) {
      this.backendUrl = url.substring(0, url.length - 1)
    } else {
      this.backendUrl = url
    }
  }

  static buildUrl(path: string): string {
    if ( path.slice(0, 1) == '/' ) {
      return `${this.backendUrl}${path}`
    }
    return `${this.backendUrl}/${path}`
  }

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
    }).catch((err) => {
      if ( this.onFailAuthorization ) this.onFailAuthorization(err)
    });
  }
};
