package model

// fixture packageに置くとmodelで使いたくなったときに循環参照になる

import (
	"bytes"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"uzume_backend/test_helper"
)

func FixtureCreateConfig() *Config {
	config, _ := NewConfig()
	config.Save()
	return config
}

func FixtureCreateWorkspace() *Workspace {
	workspace := new(Workspace)
	workspace.Name = "ワークスペース"
	workspace.Path = test_helper.BuildFilePath("workspace1.uzume")
	workspace.CreateWorkspaceDirAndSave()
	return workspace
}

func FixtureCreateImage(workspace *Workspace, image_name string) (*Image, error) {
	image_file, err := os.Open(filepath.Join("./../fixture/", image_name))
	if err != nil {
		fmt.Printf("open error: %s\n", err.Error())
		return nil, err
	}
	buffer := new(bytes.Buffer)
	if _, err := io.Copy(buffer, image_file); err != nil {
		fmt.Printf("copy: %s\n", err.Error())
		return nil, err
	}

	image := NewImage(workspace)
	if err := image.CreateImageAndSave(image_name, buffer); err != nil {
		fmt.Printf("CreateImageAndSave: %s\n", err.Error())
		return nil, err
	}
	return image, nil
}

func FixtureSetupOneWorkspace() (*Config, *Workspace) {
	config := FixtureCreateConfig()
	workspace := FixtureCreateWorkspace()
	config.AddWorkspace(*workspace)
	config.Save()
	return config, workspace
}

func FixtureCreateTag(workspace *Workspace, tag_name string) *Tag {
	tags := NewTags(workspace)
	tag, _ := tags.CreateNewTag(tag_name)
	tags.Save()
	return tag
}
