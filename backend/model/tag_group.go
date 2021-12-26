package model

import (
	"encoding/json"
	"errors"
	"path/filepath"

	"github.com/google/uuid"
)

type TagGroup struct {
	Id   string `json:"tag_group_id"`
	Name string `json:"name"`
}

type TagGroups struct {
	Workspace *Workspace  `json:"-"`
	List      []*TagGroup `json:"tag_groups"`
}

func NewTagGroups(workspace *Workspace) *TagGroups {
	tag_group := new(TagGroups)
	tag_group.Workspace = workspace
	tag_group.Load()
	return tag_group
}

func (this *TagGroups) FindTagGroupById(tag_group_id string) (*TagGroup, error) {
	for _, t := range this.List {
		if t.Id == tag_group_id {
			return t, nil
		}
	}

	return nil, errors.New("tag_groupが見つかりませんでした")
}

func (this *TagGroups) Load() error {
	json_accessor := NewJsonAccessor()
	bytes, err := json_accessor.ReadJson(this.TagGroupsJsonPath())
	if err != nil {
		return err
	}
	if err := json.Unmarshal(bytes, this); err != nil {
		return err
	}

	return nil
}

func (this *TagGroups) Save() error {
	json_path := this.TagGroupsJsonPath()
	json_accessor := NewJsonAccessor()
	if err := json_accessor.SaveJson(json_path, this); err != nil {
		return err
	}

	return nil
}

func (this *TagGroups) GetAllTagGroups() []*TagGroup {
	return this.List
}

func (this *TagGroups) CreateNewTagGroup(name string) (*TagGroup, error) {
	tag_group := new(TagGroup)
	new_uuid, err := uuid.NewRandom()
	if err != nil {
		return nil, err
	}
	tag_group.Id = new_uuid.String()
	tag_group.Name = name
	this.List = append(this.List, tag_group)

	return tag_group, nil
}

func (this *TagGroups) UpdateTagGroup(tag_group_id, name string) error {
	for _, tg := range this.List {
		if tg.Id == tag_group_id {
			tg.Name = name
			return nil
		}
	}

	return errors.New("The tag_group_id doesn't exist.")
}

func (this *TagGroups) DeleteTagGroup(tag_group_id string) {
	var new_tag_group_list []*TagGroup
	for _, t := range this.List {
		if t.Id != tag_group_id {
			new_tag_group_list = append(new_tag_group_list, t)
		}
	}

	this.List = new_tag_group_list
}

func (this *TagGroups) TagGroupsJsonPath() string {
	return filepath.Join(this.Workspace.Path, "tag_groups.json")
}
