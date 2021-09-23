package model

import (
	"encoding/json"
	"errors"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"uzume_backend/helper"

	"github.com/google/uuid"
)

type Workspace struct {
	Id   string `json:"workspace_id"`
	Name string `json:"name"`
	Path string `json:"path"`
}

func NewWorkspaceById(workspace_id string) (*Workspace, error) {
	config := new(Config)
	config.Load()
	ok, workspace_path := config.FindWorkspacePath(workspace_id)
	if !ok {
		return nil, errors.New("workspaceが見つかりませんでした")
	}

	workspace := new(Workspace)
	workspace.Id = workspace_id
	workspace.Path = workspace_path
	workspace.Load()

	return workspace, nil
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

func (this *Workspace) UpdateWorkspaceIcon(img *multipart.FileHeader) error {
	config := new(Config)
	config.Load()

	src, err := img.Open()
	if err != nil {
		return err
	}
	defer src.Close()

	_, ext := helper.SplitFileNameAndExt(img.Filename)

	icon_files, err := this.WorkspaceIconFiles()
	if err != nil {
		return err
	}
	for _, f := range icon_files {
		if err := os.Remove(f); err != nil {
			return err
		}
	}

	file_path := filepath.Join(this.Path, "icon."+ext)

	dst, err := os.Create(file_path)
	if err != nil {
		return err
	}
	defer dst.Close()

	if _, err := io.Copy(dst, src); err != nil {
		return err
	}

	return nil
}

func (this *Workspace) WorkspaceIconFiles() ([]string, error) {
	icon_files, err := filepath.Glob(filepath.Join(this.Path, "icon.*"))
	if err != nil {
		return nil, err
	}

	return icon_files, nil
}
