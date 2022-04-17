// BC: BackendConnector
import BCWorkspace from './workspace';
const axiosBase = require('axios');
const compareVersions = require('compare-versions');

export type ResVersion = {
  version: string
}

class BackendStatus {
  static readonly INIT: number = 1;
  static readonly PROCESSING: number = 2;
  static readonly BACKEND_OK: number = 3;
  static readonly BACKEND_NOTFOUND: number = 4;
  static readonly BACKEND_VERSION_ERROR: number = 5;
}

export default class BackendConnector {
  // バージョン設定
  private static backendMinorVersion = '0.0'
  static latestBackendVersion = `${BackendConnector.backendMinorVersion}.3`

  static loggingEnable = true
  static backendStatus = BackendStatus.INIT
  static Workspace = BCWorkspace
  
  static workspaceList: { [key: string]: BCWorkspace; } = {}
  static onBackendOk: (() => void) | null = null
  static onBackendVersionError: (() => void) | null = null
  static onBackendNotFound: (() => void) | null = null
  static onFailAuthorization: ((err: any) => void) | null = null
  private static backendUrl: string | null = null

  static resetStatus() {
    this.backendStatus = BackendStatus.INIT;
  }

  static setBackendUrl(url: string) {
    if ( this.backendStatus != BackendStatus.INIT ) return;
    this.backendStatus = BackendStatus.PROCESSING;

    if ( url.slice(-1) == '/' ) {
      this.backendUrl = url.substring(0, url.length - 1)
    } else {
      this.backendUrl = url
    }

    this.fetchVersion((version: string) => {
      // マイナーバージョンの一致まで確認するため、patchは0固定
      if ( compareVersions.satisfies(version, `~${BackendConnector.backendMinorVersion}.0`) ) {
        this.backendStatus = BackendStatus.BACKEND_OK;
        if ( this.onBackendOk ) this.onBackendOk();
      } else {
        this.backendStatus = BackendStatus.BACKEND_VERSION_ERROR;
        if ( this.onBackendVersionError ) this.onBackendVersionError();
      }
    })
  }

  static buildUrl(path: string): string {
    if ( path.slice(0, 1) == '/' ) {
      return `${this.backendUrl}${path}`
    }
    return `${this.backendUrl}/${path}`
  }

  static fetchVersion(callback: (version: string) => void) {
    let axios = axiosBase.create({
      baseURL: BackendConnector.buildUrl('/api/version'),
      headers: {
        'Content-Type': 'application/json',
      },
      responseType: 'json'
    });

    axios.get('').then((res:any) => {
      let resVer = JSON.parse(JSON.stringify(res.data)) as ResVersion
      callback(resVer.version)
    }).catch(() => {
      this.backendStatus = BackendStatus.BACKEND_NOTFOUND;
      if ( this.onBackendNotFound ) this.onBackendNotFound();
    });
  }

  static workspace(workspaceId: string, callback: (workspace: BCWorkspace) => void) {
    if ( this.backendStatus != BackendStatus.BACKEND_OK ) {
      if ( this.onFailAuthorization ) this.onFailAuthorization(`バックエンドの状態が異常です status=${this.backendStatus}`)
      return;
    }

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
