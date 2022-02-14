package api

import (
	"net/http"
	"uzume_backend/helper"
	"uzume_backend/model"

	"github.com/labstack/echo"
)

func GetWorkspaces() echo.HandlerFunc {
	return func(c echo.Context) (err error) {
		config, err := model.NewConfig()
		if err != nil {
			return err
		}

		type resWorkspace struct {
			Workspace_id string `json:"workspace_id"`
			Name         string `json:"name"`
			Available    bool   `json:"available"`
		}

		res_workspaces := make([]resWorkspace, 0, 5)
		for _, conf_ws := range config.GetWorkspaces() {
			ws, err := model.FindWorkspaceById(conf_ws.WorkspaceId)
			if err != nil {
				return err
			}

			res_ws := new(resWorkspace)
			res_ws.Workspace_id = conf_ws.WorkspaceId
			res_ws.Name = conf_ws.Name
			res_ws.Available = ws.IsAlive()
			res_workspaces = append(res_workspaces, *res_ws)
		}

		return c.JSON(http.StatusOK, res_workspaces)
	}
}

func PostWorkspaces() echo.HandlerFunc {
	return func(c echo.Context) (err error) {
		param := new(struct {
			Name string `json:"name"`
			Path string `json:"path"`
		})
		if err := c.Bind(param); err != nil {
			return err
		}
		workspace := new(model.Workspace)
		workspace.Name = param.Name
		workspace.Path = param.Path

		config, err := model.NewConfig()
		if err != nil {
			return err
		}

		if config.WorkspacePathExists(workspace.Path) {
			return c.JSON(http.StatusBadRequest, helper.ErrorMessage{ErrorMessage: "configに既に存在しています"})
		}

		// workspace作成
		if err := workspace.CreateWorkspaceDirAndSave(); err != nil {
			return c.JSON(http.StatusBadRequest, helper.ErrorMessage{ErrorMessage: "ディスクに既に存在しています"})
		}

		// configにworkspace情報を追記
		if err := config.AddWorkspace(*workspace); err != nil {
			return err
		}

		if err := config.Save(); err != nil {
			return err
		}

		return c.JSON(http.StatusCreated, struct {
			WorkspaceId string `json:"workspace_id"`
		}{
			WorkspaceId: workspace.Id,
		})
	}
}

func PostWorkspacesAdd() echo.HandlerFunc {
	return func(c echo.Context) (err error) {
		param := new(struct {
			WorkspacePath string `json:"workspace_path"`
		})
		if err := c.Bind(param); err != nil {
			return err
		}

		config, err := model.NewConfig()
		if err != nil {
			return err
		}

		workspace, err := model.FindWorkspaceByPath(param.WorkspacePath)
		if err != nil {
			if err.Error() == "The workspace doesn't exist." {
				return c.JSON(http.StatusBadRequest, helper.ErrorMessage{ErrorMessage: err.Error()})
			}
			return err
		}

		// configにworkspace情報を追記
		if err := config.AddWorkspace(*workspace); err != nil {
			return c.JSON(http.StatusBadRequest,
				helper.ErrorMessage{ErrorMessage: err.Error()})
		}

		if err := config.Save(); err != nil {
			return err
		}

		return c.JSON(http.StatusCreated, struct {
			WorkspaceId string `json:"workspace_id"`
		}{
			WorkspaceId: workspace.Id,
		})
	}
}

func PostWorkspacesLogin() echo.HandlerFunc {
	return func(c echo.Context) (err error) {
		param := new(struct {
			Workspace_id string `json:"workspace_id"`
		})
		if err := c.Bind(param); err != nil {
			return err
		}

		config, err := model.NewConfig()
		if err != nil {
			return err
		}

		if !config.WorkspaceIdExists(param.Workspace_id) {
			return c.JSON(http.StatusBadRequest, helper.ErrorMessage{ErrorMessage: "ワークスペースIDが登録されていません"})
		}

		access_token, err := model.GenerateAccessToken(param.Workspace_id)
		if err != nil {
			return err
		}

		return c.JSON(http.StatusOK, struct {
			AccessToken string `json:"access_token"`
		}{
			AccessToken: access_token,
		})
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
		config, err := model.NewConfig()
		if err != nil {
			return err
		}
		ok, workspace_path := config.FindWorkspacePath(workspace_id)
		if !ok {
			return c.JSON(http.StatusBadRequest, helper.ErrorMessage{ErrorMessage: "ワークスペースがありません"})
		}

		// workspace_pathからworkspaceフォルダにアクセスし、データを書き換える
		workspace, err := model.FindWorkspaceByPath(workspace_path)
		if err != nil {
			return err
		}
		workspace.Name = param.Name
		if err := workspace.Save(); err != nil {
			return err
		}

		// workspaceに行った変更をconfigファイルに反映させる
		config.UpdateWorkspace(*workspace)
		if err := config.Save(); err != nil {
			return err
		}

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
		config, err := model.NewConfig()
		if err != nil {
			return err
		}

		if err := config.DeleteWorkspaceAndSave(workspace_id); err != nil {
			return c.JSON(http.StatusBadRequest, helper.ErrorMessage{ErrorMessage: "ワークスペースの削除に失敗しました"})
		}

		return c.JSON(http.StatusNoContent, "")
	}
}

func GetWorkspaceIcon() echo.HandlerFunc {
	return func(c echo.Context) (err error) {
		workspace_id := helper.LoggedinWrokspaceId(c)

		workspace, err := model.FindWorkspaceById(workspace_id)
		if err != nil {
			return err
		}

		icon_file_paths, err := workspace.WorkspaceIconFilePaths()
		if err != nil {
			return err
		}

		if len(icon_file_paths) == 0 {
			return c.JSON(http.StatusNotFound, "")
		}

		return c.File(icon_file_paths[0])
	}
}

func PostWorkspaceIcon() echo.HandlerFunc {
	return func(c echo.Context) (err error) {
		icon_file, err := c.FormFile("icon")
		if err != nil {
			return err
		}
		workspace_id := helper.LoggedinWrokspaceId(c)

		workspace, err := model.FindWorkspaceById(workspace_id)
		if err != nil {
			return err
		}

		workspace.UpdateWorkspaceIcon(icon_file)
		return c.JSON(http.StatusCreated, "")
	}
}

func DeleteWorkspaceIcon() echo.HandlerFunc {
	return func(c echo.Context) (err error) {
		workspace_id := helper.LoggedinWrokspaceId(c)

		workspace, err := model.FindWorkspaceById(workspace_id)
		if err != nil {
			return err
		}

		workspace.DeleteWorkspaceIcon()
		return c.JSON(http.StatusCreated, "")
	}
}

func PostWorkspaceRefleshCache() echo.HandlerFunc {
	return func(c echo.Context) (err error) {
		workspace_id := helper.LoggedinWrokspaceId(c)

		workspace, err := model.FindWorkspaceById(workspace_id)
		if err != nil {
			return err
		}

		workspace.RefleshCache()

		return c.JSON(http.StatusOK, "")
	}
}
