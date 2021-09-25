package fixture

import (
	"bytes"
	"io"
	"os"
	"path/filepath"
	"uzume_backend/model"
	"uzume_backend/test_helper"
)

func CreateConfig() *model.Config {
	config, _ := model.NewConfig()
	config.Save()
	return config
}

func CreateWorkspace() *model.Workspace {
	workspace := new(model.Workspace)
	workspace.Name = "ワークスペース"
	workspace.Path = test_helper.BuildFilePath("workspace1.uzume")
	workspace.CreateWorkspaceDirAndSave()
	return workspace
}

func CreateImage(workspace *model.Workspace, image_name string) (*model.Image, error) {
	image_file, err := os.Open(filepath.Join("./../fixture/", image_name))
	if err != nil {
		return nil, err
	}
	buffer := new(bytes.Buffer)
	if _, err := io.Copy(buffer, image_file); err != nil {
		return nil, err
	}

	image := model.NewImage(workspace)
	if err := image.CreateImageAndSave(image_name, buffer); err != nil {
		return nil, err
	}
	return image, nil
}

func SetupOneWorkspace() (*model.Config, *model.Workspace) {
	config := CreateConfig()
	workspace := CreateWorkspace()
	config.AddWorkspace(*workspace)
	config.Save()
	return config, workspace
}
