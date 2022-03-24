const axiosBase = require('axios');
const fs = require('fs');
const FormData = require('form-data');
import BackendConnector from "./backendConnector";
import Image from './image'
import Tags from './tags'
import TagGroups from './tagGroups'
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
  available: boolean
}

export default class Workspace {
  workspaceId: string
  accessToken: string
  public image: Image
  public tags: Tags
  public tag_groups: TagGroups

  constructor(workspaceId: string, accessToken: string) {
    this.workspaceId = workspaceId
    this.accessToken = accessToken
    this.image = new Image(workspaceId, accessToken)
    this.tags = new Tags(workspaceId, accessToken)
    this.tag_groups = new TagGroups(workspaceId, accessToken)
  }

  static async createInstance(workspaceId: string): Promise<Workspace> {
    let accessToken = await this.login(workspaceId)
    return new Workspace(workspaceId, accessToken)
  }

  static noauthorizeAxios() {
    let axios = axiosBase.create({
      baseURL: BackendConnector.buildUrl('/api/v1/workspaces'),
      headers: {
        'Content-Type': 'application/json',
      },
      responseType: 'json'
    });
    if ( BackendConnector.loggingEnable && process.env.NODE_ENV === 'development' ) {
      axios.interceptors.request.use((request:any) => {
        console.log('request: ', request)
        return request
      });
      axios.interceptors.response.use((response:any) => {
        console.log('response: ', response.data)
        return response
      });
    }
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

  static async add(path: string) {
    try {
      await this.noauthorizeAxios().post('/add', {workspace_path: path})
    } catch (error) {
      console.log(`workspace add error [${error}]`)
    }

    return null as any
  }

  static async login(workspaceId: string): Promise<string> {
    const res = await this.noauthorizeAxios().post('/login', {workspace_id: workspaceId});
    let login = JSON.parse(JSON.stringify(res.data)) as ResLogin
    return login.access_token
  }

  private authorizeAxios() {
    let encodedString = Buffer.from(`${this.workspaceId}:${this.accessToken}`).toString('base64')
    let authorizeString = `Basic ${encodedString}`

    let axios = axiosBase.create({
      baseURL: BackendConnector.buildUrl('/api/v1/workspaces'),
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

  public async delete() {
    try {
      return await this.authorizeAxios().delete('/')
    } catch (e) {
      console.log(`workspace delete error [${e}]`)
      throw e
    }
  }

  public async postIcon(filePath: string) {
    try {
      const params = new FormData();
      params.append('icon', fs.createReadStream(filePath), filePath)
      return await this.authorizeAxios().post('/icon', params, { headers: params.getHeaders() } as any)
    } catch (e) {
      console.log(`workspace icon post error [${e}]`)
      throw e
    }
  }

  public async fetchIcon() {
    try {
      let encodedString = Buffer.from(`${this.workspaceId}:${this.accessToken}`).toString('base64')
      let authorizeString = `Basic ${encodedString}`

      let res = await axiosBase.create({
        baseURL: BackendConnector.buildUrl(`/api/v1/workspaces/icon`),
        responseType: 'arraybuffer',
        headers: {
          'Authorization': authorizeString,
          'Content-Type': 'image'
        },
      }).get()
      return res.data.toString('base64')
    } catch (e:any) {
      console.log(`fetch workspace icon error [${e}]`)
      throw e
    }
  }

  public async deleteIcon() {
    try {
      return await this.authorizeAxios().delete('/icon')
    } catch (e) {
      console.log(`workspace icon delete error [${e}]`)
      throw e
    }
  }
};
