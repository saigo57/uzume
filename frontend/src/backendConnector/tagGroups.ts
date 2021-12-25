const axiosBase = require('axios');

export type ResTagGroup = {
  tag_group_id: string
  name: string
}

export type ResTagGroupList = {
  tag_groups: ResTagGroup[]
}

export type ResTagGroupInfo = {
  tag_group: ResTagGroup
}

export default class TagGroups {
  workspaceId: string
  accessToken: string

  constructor(workspaceId: string, accessToken: string) {
    this.workspaceId = workspaceId
    this.accessToken = accessToken
  }

  private authorizeAxios() {
    let encodedString = Buffer.from(`${this.workspaceId}:${this.accessToken}`).toString('base64')
    let authorizeString = `Basic ${encodedString}`

    let axios = axiosBase.create({
      baseURL: 'http://localhost:1323/api/v1/tag_groups',
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

  public async getList(): Promise<ResTagGroupList> {
    try {
      let res
      res = await this.authorizeAxios().get('/')
      return JSON.parse(JSON.stringify(res.data)) as ResTagGroupList
    } catch (e) {
      console.log(`tag_groups get error [${e}]`)
      throw e
    }
  }

  public async createNewTagGroup(tagGroupName: string): Promise<ResTagGroup> {
    try {
      let res = await this.authorizeAxios().post('/', { name: tagGroupName  })
      let tagGroupInfo = JSON.parse(JSON.stringify(res.data)) as ResTagGroupInfo
      return tagGroupInfo.tag_group
    } catch (e) {
      console.log(`create tag_group error [${e}]`)
      throw e
    }
  }

  public async AddTagToTagGroup(tagGroupId: string, tagId: string) {
    try {
      await this.authorizeAxios().post(`/${tagGroupId}`, { tag_id: tagId })
    } catch (e) {
      console.log(`post to add tag to tag_group error [${e}]`)
      throw e
    }
  }

  public async DeleteTagGroup(tagGroupId: string) {
    try {
      await this.authorizeAxios().delete(`/${tagGroupId}`)
    } catch (e) {
      console.log(`delete tag_group error [${e}]`)
      throw e
    }
  }
}
