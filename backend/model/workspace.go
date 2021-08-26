package model

import (
	"encoding/json"
	"errors"
	"path/filepath"
	"uzume_backend/helper"

	"github.com/google/uuid"
)

type Workspace struct {
	Id   string `json:"workspace_id"`
	Name string `json:"name"`
	Path string `json:"path"`
}

func (w *Workspace) Load() error {
	json_accessor := NewJsonAccessor()
	bytes, err := json_accessor.ReadJson(w.workspaceJsonPath())
	if err != nil {
		return err
	}
	if err := json.Unmarshal(bytes, w); err != nil {
		return err
	}

	return nil
}

func (w *Workspace) Save() error {
	json_path := w.workspaceJsonPath()
	json_accessor := NewJsonAccessor()
	if err := json_accessor.SaveJson(json_path, w); err != nil {
		return err
	}

	return nil
}

func (w *Workspace) CreateWorkspaceDir() error {
	if helper.DirExists(w.Path) {
		return errors.New("ワークスペースはすでに存在しています")
	}

	new_uuid, err := uuid.NewRandom()
	if err != nil {
		return err
	}

	w.Id = new_uuid.String()
	if err := w.Save(); err != nil {
		return err
	}

	return nil
}

func (w Workspace) workspaceJsonPath() string {
	return filepath.Join(w.Path, "workspace.json")
}
