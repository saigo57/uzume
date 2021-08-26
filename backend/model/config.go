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

type WorkspaceInfo struct {
	Path        string `json:"path"`
	WorkspaceId string `json:"workspace_id"`
	Name        string // 本来はworkspace modelの方にあるべき
}

type Config struct {
	configFilePath string          `json:"-"`
	WorkspaceList  []WorkspaceInfo `json:"workspace_list"`
}

func (c *Config) Load() error {
	if helper.IsTesting() {
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
	for _, conf_w := range c.WorkspaceList {
		if w.Id == conf_w.WorkspaceId {
			return errors.New(fmt.Sprintf("このワークスペースはすでに登録されています id[%s]", w.Id))
		}
	}

	wi := new(WorkspaceInfo)
	wi.WorkspaceId = w.Id
	wi.Path = w.Path
	wi.Name = w.Name
	c.WorkspaceList = append(c.WorkspaceList, *wi)

	return nil
}

func (c *Config) WorkspaceExists(path string) bool {
	for _, w := range c.WorkspaceList {
		if w.Path == path {
			return true
		}
	}
	return false
}
