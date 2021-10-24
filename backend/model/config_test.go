package model

import (
	"fmt"
	"testing"
	"uzume_backend/helper"
	"uzume_backend/test_helper"

	"github.com/stretchr/testify/assert"
)

func TestNewConfig(t *testing.T) {
	test_helper.InitializeTest()
	file_path := test_helper.BuildFilePath("/.uzume/config.json")
	assert.Equal(t, helper.FileExists(file_path), false)
	NewConfig()
	assert.Equal(t, helper.FileExists(file_path), true)
}

func TestConfigLoad(t *testing.T) {
	test_helper.InitializeTest()
	config, _ := NewConfig()

	json_accessor := NewJsonAccessor()
	file_path := test_helper.BuildFilePath("/.uzume/config.json")
	c := new(Config)
	c.WorkspaceList = append(c.WorkspaceList, WorkspaceInfo{
		Path:        "/some/test/path",
		WorkspaceId: "test_workspace_id",
		Name:        "workspace name",
	})
	json_accessor.SaveJson(file_path, c)

	config.Load()

	assert.Equal(t, 1, len(config.WorkspaceList))
	assert.Equal(t, "/some/test/path", config.WorkspaceList[0].Path)
	assert.Equal(t, "test_workspace_id", config.WorkspaceList[0].WorkspaceId)
	assert.Equal(t, "workspace name", config.WorkspaceList[0].Name)
}

func TestConfigSave(t *testing.T) {
	test_helper.InitializeTest()
	config, _ := NewConfig()

	config.WorkspaceList = append(config.WorkspaceList, WorkspaceInfo{
		Path:        "/some/test/path",
		WorkspaceId: "test_workspace_id",
		Name:        "workspace name",
	})
	config.Save()

	config2, _ := NewConfig()
	assert.Equal(t, 1, len(config2.WorkspaceList))
	assert.Equal(t, "/some/test/path", config2.WorkspaceList[0].Path)
	assert.Equal(t, "test_workspace_id", config2.WorkspaceList[0].WorkspaceId)
	assert.Equal(t, "workspace name", config2.WorkspaceList[0].Name)
}

func TestConfigGetWorkspaces(t *testing.T) {
	test_helper.InitializeTest()
	config, _ := NewConfig()

	config.WorkspaceList = append(config.WorkspaceList, WorkspaceInfo{
		Path:        "/some/test/path",
		WorkspaceId: "test_workspace_id",
		Name:        "workspace name",
	})
	config.WorkspaceList = append(config.WorkspaceList, WorkspaceInfo{
		Path:        "/some/test/path2",
		WorkspaceId: "test_workspace_id2",
		Name:        "workspace name2",
	})
	config.Save()

	workspaces := config.GetWorkspaces()
	assert.Equal(t, 2, len(workspaces))
	assert.Equal(t, "test_workspace_id", workspaces[0].WorkspaceId)
	assert.Equal(t, "test_workspace_id2", workspaces[1].WorkspaceId)
}

func TestConfigAddWorkspace(t *testing.T) {
	test_helper.InitializeTest()
	config, _ := NewConfig()

	assert.Equal(t, 0, len(config.GetWorkspaces()))

	workspace1 := new(Workspace)
	workspace1.Name = "ワークスペース1"
	workspace1.Path = test_helper.BuildFilePath("workspace1.uzume")
	workspace1.CreateWorkspaceDirAndSave()
	config.AddWorkspace(*workspace1)
	assert.Equal(t, 1, len(config.GetWorkspaces()))

	workspace2 := new(Workspace)
	workspace2.Name = "ワークスペース2"
	workspace2.Path = test_helper.BuildFilePath("workspace2.uzume")
	workspace2.CreateWorkspaceDirAndSave()
	config.AddWorkspace(*workspace2)
	assert.Equal(t, 2, len(config.GetWorkspaces()))
}

func TestConfigAddWorkspace_duplicate(t *testing.T) {
	test_helper.InitializeTest()
	config, _ := NewConfig()

	assert.Equal(t, 0, len(config.GetWorkspaces()))

	workspace := new(Workspace)
	workspace.Name = "ワークスペース1"
	workspace.Path = test_helper.BuildFilePath("workspace.uzume")
	workspace.CreateWorkspaceDirAndSave()
	config.AddWorkspace(*workspace)
	assert.Equal(t, 1, len(config.GetWorkspaces()))

	err := config.AddWorkspace(*workspace)
	assert.Equal(t, 1, len(config.GetWorkspaces()))
	assert.Equal(t, fmt.Sprintf("このワークスペースはすでに登録されています id[%s]", workspace.Id), err.Error())
}

func TestConfigUpdateWorkspace(t *testing.T) {
	test_helper.InitializeTest()
	config, _ := NewConfig()

	assert.Equal(t, 0, len(config.GetWorkspaces()))

	workspace := new(Workspace)
	workspace.Name = "ワークスペース"
	workspace.Path = test_helper.BuildFilePath("workspace.uzume")
	workspace.CreateWorkspaceDirAndSave()
	config.AddWorkspace(*workspace)
	config.Save()
	config.Load()
	assert.Equal(t, 1, len(config.WorkspaceList))
	assert.Equal(t, "ワークスペース", config.WorkspaceList[0].Name)
	assert.Equal(t, test_helper.BuildFilePath("workspace.uzume"), config.WorkspaceList[0].Path)

	workspace.Name = "ワークスペース2"
	workspace.Path = test_helper.BuildFilePath("workspace2.uzume")
	config.UpdateWorkspace(*workspace)
	config.Save()
	config.Load()
	assert.Equal(t, 1, len(config.WorkspaceList))
	assert.Equal(t, "ワークスペース2", config.WorkspaceList[0].Name)
	assert.Equal(t, test_helper.BuildFilePath("workspace2.uzume"), config.WorkspaceList[0].Path)
}

func TestConfigWorkspacePathExists(t *testing.T) {
	test_helper.InitializeTest()
	config, _ := NewConfig()

	assert.Equal(t, 0, len(config.GetWorkspaces()))

	workspace := new(Workspace)
	workspace.Name = "ワークスペース"
	workspace.Path = test_helper.BuildFilePath("workspace.uzume")
	workspace.CreateWorkspaceDirAndSave()
	config.AddWorkspace(*workspace)

	assert.Equal(t, true, config.WorkspacePathExists(test_helper.BuildFilePath("workspace.uzume")))
	assert.Equal(t, false, config.WorkspacePathExists(test_helper.BuildFilePath("workspace2.uzume")))
}

func TestConfigWorkspaceIdExists(t *testing.T) {
	test_helper.InitializeTest()
	config, _ := NewConfig()

	assert.Equal(t, 0, len(config.GetWorkspaces()))

	workspace := new(Workspace)
	workspace.Name = "ワークスペース"
	workspace.Path = test_helper.BuildFilePath("workspace.uzume")
	workspace.CreateWorkspaceDirAndSave()
	config.AddWorkspace(*workspace)

	assert.Equal(t, true, config.WorkspaceIdExists(workspace.Id))
	assert.Equal(t, false, config.WorkspaceIdExists("unregisterd_workspace_id"))
}

func TestConfigFindWorkspacePath(t *testing.T) {
	test_helper.InitializeTest()
	config, _ := NewConfig()

	assert.Equal(t, 0, len(config.GetWorkspaces()))

	workspace1 := new(Workspace)
	workspace1.Name = "ワークスペース1"
	workspace1.Path = test_helper.BuildFilePath("workspace1.uzume")
	workspace1.CreateWorkspaceDirAndSave()
	config.AddWorkspace(*workspace1)
	workspace2 := new(Workspace)
	workspace2.Name = "ワークスペース2"
	workspace2.Path = test_helper.BuildFilePath("workspace2.uzume")
	workspace2.CreateWorkspaceDirAndSave()
	config.AddWorkspace(*workspace2)

	ok1, ws_path1 := config.FindWorkspacePath(workspace1.Id)
	assert.Equal(t, true, ok1)
	assert.Equal(t, test_helper.BuildFilePath("workspace1.uzume"), ws_path1)

	ok2, ws_path2 := config.FindWorkspacePath("unregisterd_workspace_id")
	assert.Equal(t, false, ok2)
	assert.Equal(t, "", ws_path2)
}

func TestConfigDeleteWorkspaceAndSave(t *testing.T) {
	test_helper.InitializeTest()
	config, _ := NewConfig()

	assert.Equal(t, 0, len(config.GetWorkspaces()))

	workspace1 := new(Workspace)
	workspace1.Name = "ワークスペース1"
	workspace1.Path = test_helper.BuildFilePath("workspace1.uzume")
	workspace1.CreateWorkspaceDirAndSave()
	config.AddWorkspace(*workspace1)
	workspace2 := new(Workspace)
	workspace2.Name = "ワークスペース2"
	workspace2.Path = test_helper.BuildFilePath("workspace2.uzume")
	workspace2.CreateWorkspaceDirAndSave()
	config.AddWorkspace(*workspace2)
	config.Save()
	config.Load()

	assert.Equal(t, 2, len(config.WorkspaceList))

	config.DeleteWorkspaceAndSave(workspace1.Id)
	config.Load()
	assert.Equal(t, 1, len(config.WorkspaceList))
	assert.Equal(t, "ワークスペース2", config.WorkspaceList[0].Name)

	// ワークスペースのディレクトリ自体は消えない
	assert.Equal(t, true, helper.DirExists(workspace1.Path))
}
