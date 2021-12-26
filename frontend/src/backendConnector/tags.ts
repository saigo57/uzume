const axiosBase = require('axios');

export type ResTag = {
  tag_id: string
  name: string
  tag_group_id: string
}

export type ResTagList = {
  tags: ResTag[]
}

export type ResTagInfo = {
  tag: ResTag
}

export default class Tags {
  workspaceId: string
  accessToken: string

  constructor(workspaceId: string, accessToken: string) {
    this.workspaceId = workspaceId
    this.accessToken = accessToken
  }

  private authorizeAxiosBase(contentType: string) {
    let encodedString = Buffer.from(`${this.workspaceId}:${this.accessToken}`).toString('base64')
    let authorizeString = `Basic ${encodedString}`

    let axios = axiosBase.create({
      baseURL: 'http://localhost:1323/api/v1/tags',
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

  private authorizeAxios() {
    return this.authorizeAxiosBase('application/json')
  }

  public async getList(isFavorite: boolean): Promise<ResTagList> {
    try {
      let res
      if ( isFavorite ) {
        res = await this.authorizeAxios().get('/', { params: { type: 'favorite'} })
      } else {
        res = await this.authorizeAxios().get('/')
      }
      return JSON.parse(JSON.stringify(res.data)) as ResTagList
    } catch (e) {
      console.log(`tags get error [${e}]`)
      throw e
    }
  }

  public async createNewTag(tagName: string): Promise<ResTag> {
    try {
      let res = await this.authorizeAxios().post('/', { name: tagName  })
      let tagInfo = JSON.parse(JSON.stringify(res.data)) as ResTagInfo
      return tagInfo.tag
    } catch (e) {
      console.log(`create tag error [${e}]`)
      throw e
    }
  }

  public async renameTag(tagId: string, tagName: string) {
    try {
      await this.authorizeAxios().patch(`/${tagId}`, { name: tagName  })
    } catch (e) {
      console.log(`rename tag error [${e}]`)
      throw e
    }
  }
}
