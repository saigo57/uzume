const axiosBase = require('axios');
import { Buffer } from 'buffer'

export type ResLogin = {
  access_token: string
}

export type ResWorkspaceId = {
  workspace_id: string
}

export type ResWorkspace = {
  workspace_id: string
  name: string
  available: string
}

export default class Workspace {
  static noauthorizeAxios() {
    let axios = axiosBase.create({
      baseURL: 'http://localhost:1323/api/v1/workspaces',
      headers: {
        'Content-Type': 'application/json',
      },
      responseType: 'json'
    });
    axios.interceptors.request.use((request:any) => {
      console.log('request: ', request)
      return request
    });
    axios.interceptors.response.use((response:any) => {
      console.log('response: ', response.data)
      return response
    });
    return axios;
  }

  static async login(workspaceId: string): Promise<string> {
    const res = await this.noauthorizeAxios().post('/login', {workspace_id: workspaceId});
    let login = JSON.parse(JSON.stringify(res.data)) as ResLogin
    return login.access_token
  }

  static async authorizeAxios(workspaceId: string) {
    // TODO: accessTokenをどこかにキャッシュする
    let accessToken = await this.login(workspaceId)
    let encodedString = Buffer.from(`${workspaceId}:${accessToken}`).toString('base64')
    let authorizeString = `Basic ${encodedString}`

    let axios = axiosBase.create({
      baseURL: 'http://localhost:1323/api/v1/workspaces',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authorizeString
      },
      responseType: 'json'
    })
    axios.interceptors.request.use((request:any) => {
      console.log('request: ', request)
      return request
    });
    axios.interceptors.response.use((response:any) => {
      console.log('response: ', response.data)
      return response
    });
    return axios;
  }

  static async getList(): Promise<ResWorkspace[]> {
    try {
      const res = await this.noauthorizeAxios().get('/');
      let workspaceList = JSON.parse(JSON.stringify(res.data)) as ResWorkspace[]
      return workspaceList
    } catch (error) {
      console.log(`workspace list error [${error}]`)
    }

    return []
  }

  static async create(name: string, path: string): Promise<ResWorkspaceId> {
    try {
      const res = await this.noauthorizeAxios().post('/', {name: name, path: path})
      let workspaceId = JSON.parse(JSON.stringify(res.data)) as ResWorkspaceId
      return workspaceId
    } catch (error) {
      console.log(`workspace create error [${error}]`)
    }

    return null as any
  }

  static async delete(workspaceId: string) {
    try {
      let axios = await this.authorizeAxios(workspaceId)
      const res = axios.delete('/')
      return res
    } catch (error) {
      console.log(`workspace delete error [${error}]`)
    }
  }
};
