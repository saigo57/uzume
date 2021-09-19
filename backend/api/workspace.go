package api

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"path/filepath"
	"uzume_backend/helper"
	"uzume_backend/model"

	"github.com/labstack/echo"
)

type workspace struct {
	Workspace_id string `json:"workspace_id"`
	Name         string `json:"name"`
	Available    bool   `json:"available"`
}

type workspacePath struct {
	WorkspacePath string `json:"workspace_path"`
}

type ErrorMessage struct {
	ErrorMessage string `json:"error_message"`
}

type AccessTokenResponse struct {
	AccessToken string `json:"access_token"`
}

// TODO:workspace modelの方に移動したい
func checkAliveWorkspace(path string) bool {
	_, err := ioutil.ReadFile(filepath.Join(path, "workspace.json"))
	if err != nil {
		return false
	}
	return true
}

func GetWorkspaces() echo.HandlerFunc {
	return func(c echo.Context) (err error) {
		config := new(model.Config)
		config.Load()

		workspaces := make([]workspace, 0, 5)
		for _, ws_info := range config.GetWorkspaces() {
			w := new(workspace)
			w.Workspace_id = ws_info.WorkspaceId
			w.Name = ws_info.Name
			w.Available = checkAliveWorkspace(ws_info.Path)
			workspaces = append(workspaces, *w)
		}

		return c.JSON(http.StatusOK, workspaces)
	}
}

func PostWorkspaces() echo.HandlerFunc {
	return func(c echo.Context) (err error) {
		config := new(model.Config)
		config.Load()

		workspace := new(model.Workspace)
		if err := c.Bind(workspace); err != nil {
			return err
		}

		if config.WorkspacePathExists(workspace.Path) {
			return c.JSON(http.StatusBadRequest, ErrorMessage{ErrorMessage: "configに既に存在しています"})
		}

		// workspace作成
		if err := workspace.CreateWorkspaceDir(); err != nil {
			return c.JSON(http.StatusBadRequest, ErrorMessage{ErrorMessage: "ディスクに既に存在しています"})
		}

		// configにworkspace情報を追記
		if err := config.AddWorkspace(*workspace); err != nil {
			return err
		}

		config.Save()

		return c.JSON(http.StatusCreated, struct {
			WorkspaceId string `json:"workspace_id"`
		}{
			WorkspaceId: workspace.Id,
		})
	}
}

func PostWorkspacesAdd() echo.HandlerFunc {
	return func(c echo.Context) (err error) {
		config := new(model.Config)
		config.Load()

		param := new(workspacePath)
		if err := c.Bind(param); err != nil {
			return err
		}

		if !helper.DirExists(param.WorkspacePath) {
			return c.JSON(http.StatusBadRequest, ErrorMessage{ErrorMessage: "指定されたワークスペースが存在しません"})
		}

		workspace := new(model.Workspace)
		workspace.Path = param.WorkspacePath
		if err := workspace.Load(); err != nil {
			return err
		}

		// configにworkspace情報を追記
		if err := config.AddWorkspace(*workspace); err != nil {
			return c.JSON(http.StatusBadRequest,
				ErrorMessage{ErrorMessage: fmt.Sprintf("%s", err)})
		}

		config.Save()

		return c.JSON(http.StatusCreated, struct {
			WorkspaceId string `json:"workspace_id"`
		}{
			WorkspaceId: workspace.Id,
		})
	}
}

func PostWorkspacesLogin() echo.HandlerFunc {
	return func(c echo.Context) (err error) {
		param := new(workspace)
		if err := c.Bind(param); err != nil {
			return err
		}
		workspace_id := param.Workspace_id

		config := new(model.Config)
		config.Load()

		if !config.WorkspaceIdExists(workspace_id) {
			return c.JSON(http.StatusBadRequest, ErrorMessage{ErrorMessage: "ワークスペースIDが登録されていません"})
		}

		access_token, err := model.GenerateAccessToken(workspace_id)
		if err != nil {
			return err
		}

		return c.JSON(http.StatusOK, AccessTokenResponse{AccessToken: access_token})
	}
}

func PatchWorkspaces() echo.HandlerFunc {
	return func(c echo.Context) (err error) {
		param := new(struct {
			Name string `json:"name"`
		})
		if err := c.Bind(param); err != nil {
			return err
		}

		workspace_id := helper.LoggedinWrokspaceId(c)

		// configファイルを用いてworkspace_idからworkspace_pathを取得
		config := new(model.Config)
		config.Load()
		ok, workspace_path := config.FindWorkspacePath(workspace_id)
		if !ok {
			return c.JSON(http.StatusBadRequest, ErrorMessage{ErrorMessage: "ワークスペースがありません"})
		}

		// workspace_pathからworkspaceフォルダにアクセスし、データを書き換える
		workspace := new(model.Workspace)
		workspace.Path = workspace_path
		workspace.Load()
		workspace.Name = param.Name
		workspace.Save()

		// workspaceに行った変更をconfigファイルに反映させる
		config.UpdateWorkspace(*workspace)
		config.Save()

		return c.JSON(http.StatusNoContent, "")
	}
}

func DeleteWorkspaces() echo.HandlerFunc {
	return func(c echo.Context) (err error) {
		param := new(struct {
			AccessToken string `json:"access_token"`
		})
		if err := c.Bind(param); err != nil {
			return err
		}
		workspace_id := helper.LoggedinWrokspaceId(c)

		// configファイルを用いてworkspace_idからworkspace_pathを取得
		config := new(model.Config)
		config.Load()

		if err := config.DeleteWorkspace(workspace_id); err != nil {
			return c.JSON(http.StatusBadRequest, ErrorMessage{ErrorMessage: "ワークスペースの削除に失敗しました"})
		}

		return c.JSON(http.StatusNoContent, "")
	}
}

func GetWorkspaceIcon() echo.HandlerFunc {
	return func(c echo.Context) (err error) {
		workspace_id := helper.LoggedinWrokspaceId(c)
		workspace, err := model.NewWorkspaceById(workspace_id)
		if err != nil {
			return err
		}

		icon_files, err := workspace.WorkspaceIconFiles()
		if err != nil {
			return err
		}

		if len(icon_files) == 0 {
			return c.JSON(http.StatusNotFound, "")
		}

		return c.File(icon_files[0])
	}
}

func PostWorkspaceIcon() echo.HandlerFunc {
	return func(c echo.Context) (err error) {
		icon_file, err := c.FormFile("icon")
		if err != nil {
			return err
		}
		workspace_id := helper.LoggedinWrokspaceId(c)
		workspace, err := model.NewWorkspaceById(workspace_id)
		if err != nil {
			return err
		}

		workspace.UpdateWorkspaceIcon(icon_file)
		return c.JSON(http.StatusCreated, "")
	}
}
