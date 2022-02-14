package model

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"mime/multipart"
	"os"
	"path/filepath"
	"uzume_backend/helper"

	"github.com/google/uuid"
)

type Workspace struct {
	Id   string `json:"workspace_id"`
	Name string `json:"name"`
	Path string `json:"-"`
}

func FindWorkspaceById(workspace_id string) (*Workspace, error) {
	config, err := NewConfig()
	if err != nil {
		return nil, err
	}
	ok, workspace_path := config.FindWorkspacePath(workspace_id)
	if !ok {
		return nil, errors.New(fmt.Sprintf("workspaceが見つかりませんでした[%s]", workspace_id))
	}

	workspace := new(Workspace)
	workspace.Id = workspace_id
	workspace.Path = workspace_path
	workspace.Load()

	return workspace, nil
}

func FindWorkspaceByPath(workspace_path string) (*Workspace, error) {
	if !helper.DirExists(workspace_path) {
		return nil, errors.New("The workspace doesn't exist.")
	}

	workspace := new(Workspace)
	workspace.Path = workspace_path
	if err := workspace.Load(); err != nil {
		return nil, err
	}

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

func (w *Workspace) CreateWorkspaceDirAndSave() error {
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

func (w Workspace) IsAlive() bool {
	_, err := ioutil.ReadFile(w.workspaceJsonPath())
	if err != nil {
		return false
	}
	return true
}

func (w *Workspace) RefleshCache() error {
	if err := refleshImageCache(w); err != nil {
		return err
	}

	return nil
}

func (w Workspace) workspaceJsonPath() string {
	return filepath.Join(w.Path, "workspace.json")
}

func (this *Workspace) UpdateWorkspaceIcon(img *multipart.FileHeader) error {
	src, err := img.Open()
	if err != nil {
		return err
	}
	defer src.Close()

	_, ext := helper.SplitFileNameAndExt(img.Filename)

	icon_file_paths, err := this.WorkspaceIconFilePaths()
	if err != nil {
		return err
	}
	for _, f := range icon_file_paths {
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

func (this *Workspace) DeleteWorkspaceIcon() error {
	icon_file_paths, err := this.WorkspaceIconFilePaths()
	if err != nil {
		return err
	}
	for _, f := range icon_file_paths {
		if err := os.Remove(f); err != nil {
			return err
		}
	}

	return nil
}

func (this *Workspace) WorkspaceIconFilePaths() ([]string, error) {
	icon_files, err := filepath.Glob(filepath.Join(this.Path, "icon.*"))
	if err != nil {
		return nil, err
	}

	return icon_files, nil
}
