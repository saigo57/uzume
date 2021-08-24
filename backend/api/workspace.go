package api

import (
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
		config.Save()

		workspaces := make([]workspace, 0, 5)
		for _, ws := range config.GetWorkspaces() {
			w := new(workspace)
			w.Workspace_id = ws.WorkspaceId
			w.Name = ws.Path
			w.Available = checkAliveWorkspace(ws.Path)
			workspaces = append(workspaces, *w)
		}

		return c.JSON(http.StatusOK, workspaces)
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
