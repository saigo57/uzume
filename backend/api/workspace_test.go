package api

import (
	"io/ioutil"
	"log"
	"net/http"
	"os/user"
	"path/filepath"
	"testing"
	"uzume_backend/model"

	"github.com/labstack/echo"
	"github.com/steinfletcher/apitest"
	"github.com/stretchr/testify/assert"
)

func TestGetIndex(t *testing.T) {

	json_accessor := model.NewJsonAccessor()
	usr, _ := user.Current()
	configFilePath := filepath.Join(usr.HomeDir, "/.uzume/config.json")
	// string version
	// json_accessor.SaveJson(configFilePath,
	// 	`{
	// 		"workspace_list": [
	// 			{
	// 				"path": "/Users/tamariatsushi/uzumetest/workspace1.uzume",
	// 				"workspace_id": "96174de5-c33b-f642-b1e3-c514b100e5ee",
	// 				"Name": "ワークスペース1"
	// 			},
	// 			{
	// 				"path": "/Users/tamariatsushi/uzumetest/workspace2.uzume",
	// 				"workspace_id": "b3a3e87e-838c-c5fd-ed7e-ad2d301ac3d0",
	// 				"Name": "ワークスペース2"
	// 			}
	// 		]
	// 	}`)

	// struct version
	c := new(model.Config)
	c.WorkspaceList = []model.WorkspaceInfo{
		{
			Path:        "/Users/tamariatsushi/uzumetest/workspace1.uzume",
			WorkspaceId: "96174de5-c33b-f642-b1e3-c514b100e5ee",
			Name:        "ワークスペース1",
		},
		{
			Path:        "/Users/tamariatsushi/uzumetest/workspace2.uzume",
			WorkspaceId: "b3a3e87e-838c-c5fd-ed7e-ad2d301ac3d0",
			Name:        "ワークスペース2",
		},
	}
	json_accessor.SaveJson(configFilePath, c)

	e := echo.New()
	e.GET("/workspaces", GetWorkspaces())

	apitest.New().
		Handler(e).
		Get("/workspaces").
		Expect(t).
		Status(http.StatusOK).
		Assert(func(res *http.Response, req *http.Request) error {
			body, err := ioutil.ReadAll(res.Body)
			if err != nil {
				log.Fatal(err)
			}

			assert.JSONEq(t,
				`[
						{
							"workspace_id": "96174de5-c33b-f642-b1e3-c514b100e5ee",
							"available":    true,
							"name":         "/Users/tamariatsushi/uzumetest/workspace1.uzume"
						},
						{
							"workspace_id": "b3a3e87e-838c-c5fd-ed7e-ad2d301ac3d0",
							"name":         "/Users/tamariatsushi/uzumetest/workspace2.uzume",
							"available":    false
						}
					]`,
				(string)(body))
			return nil
		}).
		End()
}
