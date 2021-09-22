package model

import (
	"encoding/json"
	"path/filepath"

	"github.com/google/uuid"
)

const (
	SYSTEM_TAG_UNCATEGORIZED = "_system_tag_uncategorized"
)

type Tag struct {
	Id   string `json:"tag_id"`
	Name string `json:"name"`
}

type Tags struct {
	List      []*Tag     `json:"tags"`
	Workspace *Workspace `json:"-"`
}

func NewTags(workspace *Workspace) *Tags {
	tag := new(Tags)
	tag.Workspace = workspace
	tag.Load()
	return tag
}

func (this *Tags) Load() error {
	json_accessor := NewJsonAccessor()
	bytes, err := json_accessor.ReadJson(this.TagsJsonPath())
	if err != nil {
		return err
	}
	if err := json.Unmarshal(bytes, this); err != nil {
		return err
	}

	return nil
}

func (this *Tags) Save() error {
	json_path := this.TagsJsonPath()
	json_accessor := NewJsonAccessor()
	if err := json_accessor.SaveJson(json_path, this); err != nil {
		return err
	}

	return nil
}

func (this *Tags) GetAllTags() []*Tag {
	return this.List
}

func (this *Tags) CreateNewTag(name string) (*Tag, error) {
	tag := new(Tag)
	new_uuid, err := uuid.NewRandom()
	if err != nil {
		return nil, err
	}
	tag.Id = new_uuid.String()
	tag.Name = name
	this.List = append(this.List, tag)
	this.Save()

	return tag, nil
}

func (this *Tags) DeleteTag(tag_id string) error {
	var new_tag_list []*Tag
	for _, t := range this.List {
		if t.Id != tag_id {
			new_tag_list = append(new_tag_list, t)
		}
	}

	this.List = new_tag_list
	this.Save()

	return nil
}

func (this *Tags) TagsJsonPath() string {
	return filepath.Join(this.Workspace.Path, "tags.json")
}

func (this *Tags) IsValidTag(tag_id string) bool {
	if IsSystemTag(tag_id) {
		return true
	}

	for _, t := range this.List {
		if t.Id == tag_id {
			return true
		}
	}

	return false
}

func IsSystemTag(tag_id string) bool {
	system_tag_list := [...]string{
		SYSTEM_TAG_UNCATEGORIZED,
	}

	for _, system_tag := range system_tag_list {
		if tag_id == system_tag {
			return true
		}
	}

	return false
}
