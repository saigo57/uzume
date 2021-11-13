package model

import (
	"os"
	"sort"
	"testing"
	"uzume_backend/helper"
	"uzume_backend/test_helper"

	"github.com/stretchr/testify/assert"
)

func TestFindWorkspaceById(t *testing.T) {
	test_helper.InitializeTest()
	config, _ := NewConfig()
	workspace1 := new(Workspace)
	workspace1.Name = "ワークスペース1"
	workspace1.Path = test_helper.BuildFilePath("workspace1.uzume")
	workspace1.CreateWorkspaceDirAndSave()
	config.AddWorkspace(*workspace1)
	config.Save()

	w, _ := FindWorkspaceById(workspace1.Id)
	assert.Equal(t, "ワークスペース1", w.Name)
	assert.Equal(t, test_helper.BuildFilePath("workspace1.uzume"), w.Path)
}

func TestFindWorkspaceByPath(t *testing.T) {
	test_helper.InitializeTest()
	config, _ := NewConfig()
	workspace1 := new(Workspace)
	workspace1.Name = "ワークスペース1"
	workspace1.Path = test_helper.BuildFilePath("workspace1.uzume")
	workspace1.CreateWorkspaceDirAndSave()
	config.AddWorkspace(*workspace1)
	config.Save()

	w, _ := FindWorkspaceByPath(workspace1.Path)
	assert.Equal(t, "ワークスペース1", w.Name)
	assert.Equal(t, test_helper.BuildFilePath("workspace1.uzume"), w.Path)
}

func TestWorkspace_Load(t *testing.T) {
	test_helper.InitializeTest()
	config, _ := NewConfig()
	workspace1 := new(Workspace)
	workspace1.Name = "ワークスペース1"
	workspace1.Path = test_helper.BuildFilePath("workspace1.uzume")
	workspace1.CreateWorkspaceDirAndSave()
	config.AddWorkspace(*workspace1)
	config.Save()

	workspace2 := new(Workspace)
	workspace2.Path = test_helper.BuildFilePath("workspace1.uzume")
	workspace2.Load()
	assert.Equal(t, "ワークスペース1", workspace2.Name)
	assert.Equal(t, test_helper.BuildFilePath("workspace1.uzume"), workspace2.Path)
}

func TestWorkspace_Save(t *testing.T) {
	test_helper.InitializeTest()
	config, _ := NewConfig()
	workspace1 := new(Workspace)
	workspace1.Name = "ワークスペース1"
	workspace1.Path = test_helper.BuildFilePath("workspace1.uzume")
	workspace1.CreateWorkspaceDirAndSave()
	config.AddWorkspace(*workspace1)
	config.Save()

	workspace1.Name = "ワークスペースchange"

	workspace2 := new(Workspace)
	workspace2.Path = test_helper.BuildFilePath("workspace1.uzume")
	workspace2.Load()
	assert.Equal(t, "ワークスペース1", workspace2.Name)
	assert.Equal(t, test_helper.BuildFilePath("workspace1.uzume"), workspace2.Path)

	workspace1.Save()

	workspace2.Load()
	assert.Equal(t, "ワークスペースchange", workspace2.Name)
	assert.Equal(t, test_helper.BuildFilePath("workspace1.uzume"), workspace2.Path)
}

func TestWorkspace_CreateWorkspaceDirAndSave(t *testing.T) {
	test_helper.InitializeTest()
	workspace1 := new(Workspace)
	workspace1.Name = "ワークスペース1"
	workspace1.Path = test_helper.BuildFilePath("workspace1.uzume")
	assert.Equal(t, 0, len(workspace1.Id))
	assert.Equal(t, false, helper.DirExists(workspace1.Path))
	workspace1.CreateWorkspaceDirAndSave()
	assert.Equal(t, 36, len(workspace1.Id))
	assert.Equal(t, true, helper.DirExists(workspace1.Path))

	workspace2 := new(Workspace)
	workspace2.Name = "ワークスペース2"
	workspace2.Path = test_helper.BuildFilePath("workspace1.uzume") // 重複
	err := workspace2.CreateWorkspaceDirAndSave()
	assert.Equal(t, "ワークスペースはすでに存在しています", err.Error())
}

func TestWorkspace_IsAlive(t *testing.T) {
	test_helper.InitializeTest()
	workspace := new(Workspace)
	workspace.Name = "ワークスペース1"
	workspace.Path = test_helper.BuildFilePath("workspace.uzume")
	assert.Equal(t, false, workspace.IsAlive())
	workspace.CreateWorkspaceDirAndSave()
	assert.Equal(t, true, workspace.IsAlive())
}

// func TestWorkspace_RefleshCache(t *testing.T) {
// }

func TestWorkspace_workspaceJsonPath(t *testing.T) {
	test_helper.InitializeTest()
	workspace := new(Workspace)
	workspace.Path = test_helper.BuildFilePath("workspace.uzume")
	assert.Equal(t, test_helper.BuildFilePath("workspace.uzume/workspace.json"), workspace.workspaceJsonPath())
}

// func TestWorkspace_UpdateWorkspaceIcon(t *testing.T) {
// }

func TestWorkspace_WorkspaceIconFilePaths(t *testing.T) {
	test_helper.InitializeTest()
	workspace := new(Workspace)
	workspace.Name = "ワークスペース1"
	workspace.Path = test_helper.BuildFilePath("workspace.uzume")
	workspace.CreateWorkspaceDirAndSave()

	file1, _ := os.Create(test_helper.BuildFilePath("workspace.uzume/icon.a"))
	defer file1.Close()
	file2, _ := os.Create(test_helper.BuildFilePath("workspace.uzume/icon.b"))
	defer file2.Close()
	file3, _ := os.Create(test_helper.BuildFilePath("workspace.uzume/icon.c"))
	defer file3.Close()

	paths, _ := workspace.WorkspaceIconFilePaths()
	sort.Slice(paths, func(i, j int) bool { return paths[i] < paths[j] })
	assert.Equal(t, 3, len(paths))
	assert.Equal(t, test_helper.BuildFilePath("workspace.uzume/icon.a"), paths[0])
	assert.Equal(t, test_helper.BuildFilePath("workspace.uzume/icon.b"), paths[1])
	assert.Equal(t, test_helper.BuildFilePath("workspace.uzume/icon.c"), paths[2])
}
