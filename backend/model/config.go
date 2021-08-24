package model

import (
	"encoding/json"
	"fmt"
	"os/user"
	"path/filepath"
)

// メモ
// {
//   "workspace_list": [
//     {
//       "path": "/Users/tamariatsushi/uzumetest/workspace1.uzume",
//       "workspace_id": "96174de5-c33b-f642-b1e3-c514b100e5ee",
//       "Name": "ワークスペース1"
//     },
//     {
//       "path": "/Users/tamariatsushi/uzumetest/workspace2.uzume",
//       "workspace_id": "b3a3e87e-838c-c5fd-ed7e-ad2d301ac3d0",
//       "Name": "ワークスペース2"
//     }
//   ]
// }

type WorkspaceInfo struct {
	Path        string `json:"path"`
	WorkspaceId string `json:"workspace_id"`
	Name        string // 本来はworkspace modelの方にあるべき
}

type Config struct {
	configFilePath string          `json:"-"`
	WorkspaceList  []WorkspaceInfo `json:"workspace_list"`
}

func (c *Config) Load() {
	usr, _ := user.Current()
	c.configFilePath = filepath.Join(usr.HomeDir, "/.uzume/config.json")

	json_accessor := NewJsonAccessor()
	bytes, err := json_accessor.ReadJson(c.configFilePath)
	if err != nil {
		fmt.Println(err)
	}
	if err := json.Unmarshal(bytes, c); err != nil {
		fmt.Println(err)
	}
}

func (c *Config) Save() {
	json_accessor := NewJsonAccessor()
	err := json_accessor.SaveJson(c.configFilePath, c)
	if err != nil {
		fmt.Println(err)
	}
}

func (c *Config) GetWorkspaces() []WorkspaceInfo {
	return c.WorkspaceList
}
