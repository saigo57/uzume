package api

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"path/filepath"
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
		for _, ws := range config.GetWorkspaces() {
			w := new(workspace)
			w.Workspace_id = ws.WorkspaceId
			w.Name = ws.Name
			w.Available = checkAliveWorkspace(ws.Path)
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

		if config.WorkspaceExists(workspace.Path) {
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

		return c.JSON(http.StatusCreated, "{}")
	}
}

func PostWorkspacesAdd() echo.HandlerFunc {
	return func(c echo.Context) (err error) {
		config := new(model.Config)
		config.Load()

		wp := new(workspacePath)
		if err := c.Bind(wp); err != nil {
			return err
		}
		c.Bind(wp)

		workspace := new(model.Workspace)
		workspace.Path = wp.WorkspacePath
		workspace.Load()

		// configにworkspace情報を追記
		if err := config.AddWorkspace(*workspace); err != nil {
			return c.JSON(http.StatusBadRequest,
				ErrorMessage{ErrorMessage: fmt.Sprintf("%s", err)})
		}

		config.Save()

		return c.JSON(http.StatusCreated, "{}")
	}
}

func GetWorkspacesLogin() echo.HandlerFunc {
	return func(c echo.Context) (err error) {
		dat := map[string]string{
			"data": "hello workspace",
		}
		return c.JSON(http.StatusOK, dat)
	}
}
