package model

import (
	"encoding/json"
	"errors"
	"fmt"
	"os/user"
	"path/filepath"
	"uzume_backend/helper"
	"uzume_backend/test_helper"
)

var IsE2ETest = false

type WorkspaceInfo struct {
	Path        string `json:"path"`
	WorkspaceId string `json:"workspace_id"`
	Name        string `json:"name"`
}

type Config struct {
	configFilePath string          `json:"-"`
	ServerPort     int             `json:"server_port"`
	WorkspaceList  []WorkspaceInfo `json:"workspace_list"`
}

func NewConfig() (*Config, error) {
	config := new(Config)
	if err := config.Load(); err != nil {
		if err := config.Save(); err != nil {
			return nil, err
		}
	}

	return config, nil
}

func (c *Config) Load() error {
	if IsE2ETest {
		usr, _ := user.Current()
		c.configFilePath = filepath.Join(usr.HomeDir, "/.uzume/e2e-test/e2e-test-config.json")
	} else if helper.IsTesting() {
		c.configFilePath = test_helper.BuildFilePath("/.uzume/config.json")
	} else {
		usr, _ := user.Current()
		c.configFilePath = filepath.Join(usr.HomeDir, "/.uzume/config.json")
	}

	json_accessor := NewJsonAccessor()
	bytes, err := json_accessor.ReadJson(c.configFilePath)
	if err != nil {
		return err
	}
	if err := json.Unmarshal(bytes, c); err != nil {
		return err
	}

	return nil
}

func (c *Config) Save() error {
	json_accessor := NewJsonAccessor()
	err := json_accessor.SaveJson(c.configFilePath, c)
	if err != nil {
		return err
	}

	return nil
}

func (c *Config) GetWorkspaces() []WorkspaceInfo {
	return c.WorkspaceList
}

func (c *Config) AddWorkspace(w Workspace) error {
	if c.WorkspaceIdExists(w.Id) {
		return errors.New(fmt.Sprintf("このワークスペースはすでに登録されています id[%s]", w.Id))
	}

	wi := new(WorkspaceInfo)
	wi.WorkspaceId = w.Id
	wi.Path = w.Path
	wi.Name = w.Name
	c.WorkspaceList = append(c.WorkspaceList, *wi)

	return nil
}

func (c *Config) UpdateWorkspace(ws Workspace) error {
	for i, _ := range c.WorkspaceList {
		if c.WorkspaceList[i].WorkspaceId == ws.Id {
			c.WorkspaceList[i].Name = ws.Name
			c.WorkspaceList[i].Path = ws.Path
			return nil
		}
	}

	return nil
}

func (c *Config) WorkspacePathExists(path string) bool {
	for _, w := range c.WorkspaceList {
		if w.Path == path {
			return true
		}
	}
	return false
}

func (c *Config) WorkspaceIdExists(id string) bool {
	for _, conf_w := range c.WorkspaceList {
		if id == conf_w.WorkspaceId {
			return true
		}
	}
	return false
}

func (c *Config) FindWorkspacePath(workspace_id string) (bool, string) {
	for _, conf_w := range c.WorkspaceList {
		if conf_w.WorkspaceId == workspace_id {
			return true, conf_w.Path
		}
	}
	return false, ""
}

func (c *Config) DeleteWorkspaceAndSave(workspace_id string) error {
	var workspace_list []WorkspaceInfo
	for _, conf_w := range c.WorkspaceList {
		if conf_w.WorkspaceId == workspace_id {
			continue
		}
		workspace_list = append(workspace_list, conf_w)
	}
	c.WorkspaceList = workspace_list

	return c.Save()
}
