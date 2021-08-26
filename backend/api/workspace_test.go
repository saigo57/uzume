package api

import (
	"io/ioutil"
	"log"
	"net/http"
	"testing"
	"uzume_backend/model"
	"uzume_backend/test_helper"

	"github.com/labstack/echo"
	"github.com/steinfletcher/apitest"
	"github.com/stretchr/testify/assert"
)

func TestGetWorkspaces(t *testing.T) {
	test_helper.InitializeTest()

	json_accessor := model.NewJsonAccessor()
	configFilePath := test_helper.BuildFilePath("/.uzume/config.json")

	// configファイル作成
	c := new(model.Config)
	c.WorkspaceList = []model.WorkspaceInfo{
		{
			Path:        test_helper.BuildFilePath("workspace1.uzume"),
			WorkspaceId: "96174de5-c33b-f642-b1e3-c514b100e5ee",
			Name:        "ワークスペース1",
		},
		{
			Path:        test_helper.BuildFilePath("workspace2.uzume"),
			WorkspaceId: "b3a3e87e-838c-c5fd-ed7e-ad2d301ac3d0",
			Name:        "ワークスペース2",
		},
	}
	json_accessor.SaveJson(configFilePath, c)

	// ワークスペース作成→availableのテスト用
	w := new(model.Workspace)
	w.Id = "b3a3e87e-838c-c5fd-ed7e-ad2d301ac3d0"
	w.Name = "ワークスペース2"
	w.Path = test_helper.BuildFilePath("workspace2.uzume")
	w.Save()

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
							"name":         "ワークスペース1",
							"available":    false
						},
						{
							"workspace_id": "b3a3e87e-838c-c5fd-ed7e-ad2d301ac3d0",
							"name":         "ワークスペース2",
							"available":    true
						}
					]`,
				(string)(body))
			return nil
		}).
		End()
}

func TestPostWorkspaces_Success(t *testing.T) {
	test_helper.InitializeTest()

	e := echo.New()
	e.POST("/workspaces", PostWorkspaces())

	c := new(model.Config)
	c.Save()

	workspace_path := test_helper.BuildFilePath("workspace1.uzume")

	apitest.New().
		Handler(e).
		Post("/workspaces").
		FormData("name", "新規ワークスペース").
		FormData("path", workspace_path).
		Expect(t).
		Status(http.StatusCreated).
		End()

	w := new(model.Workspace)
	w.Path = workspace_path
	w.Load()

	assert.Equal(t, len(w.Id), 36)
	assert.Equal(t, w.Name, "新規ワークスペース")
	assert.Equal(t, w.Path, workspace_path)
}

func TestPostWorkspaces_FailOnWorkspaceAlreadyExists_disk(t *testing.T) {
	test_helper.InitializeTest()

	e := echo.New()
	e.POST("/workspaces", PostWorkspaces())

	c := new(model.Config)
	c.Save()

	workspace_path := test_helper.BuildFilePath("workspace1.uzume")

	workspace := new(model.Workspace)
	workspace.Name = "ワークスペース"
	workspace.Path = workspace_path
	workspace.CreateWorkspaceDir()

	apitest.New().
		Handler(e).
		Post("/workspaces").
		FormData("name", "新規ワークスペース").
		FormData("path", workspace_path).
		Expect(t).
		Status(http.StatusBadRequest).
		End()
}

func TestPostWorkspacesAdd(t *testing.T) {
	test_helper.InitializeTest()

	e := echo.New()
	e.POST("/workspaces/add", PostWorkspacesAdd())

	c := new(model.Config)
	c.Save()
	assert.Equal(t, 0, len(c.WorkspaceList))

	workspace_path := test_helper.BuildFilePath("workspace1.uzume")

	workspace := new(model.Workspace)
	workspace.Name = "ワークスペース"
	workspace.Path = workspace_path
	workspace.CreateWorkspaceDir()

	// 1回目は成功
	apitest.New().
		Handler(e).
		Post("/workspaces/add").
		FormData("workspace_path", workspace_path).
		Expect(t).
		Status(http.StatusCreated).
		End()

	c.Load()
	assert.Equal(t, 1, len(c.WorkspaceList))

	// 2回目はID重複エラー
	apitest.New().
		Handler(e).
		Post("/workspaces/add").
		FormData("workspace_path", workspace_path).
		Expect(t).
		Status(http.StatusBadRequest).
		End()
	c.Load()
	assert.Equal(t, 1, len(c.WorkspaceList))
}
