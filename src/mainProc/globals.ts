import { WorkspaceInfo } from '../ipc/workspaceList'
import { CurrentWorkspace } from '../ipc/currentWorkspace'
import { RequestImage, ImageInfo } from '../ipc/images'

type ImageInfoMap = { [key: string]: ImageInfo }

export class Globals {
  static workspaceList: WorkspaceInfo[] = []
  static currentWorkspace: CurrentWorkspace = {
    workspace_name: '',
    workspace_id: '',
  }
  static imageInfoList: { [key: string]: ImageInfoMap } = {}
  static thumb_image_queue = [] as RequestImage[]
}
