package model

import (
	"encoding/json"
	"errors"
	"path/filepath"

	"github.com/google/uuid"
)

const (
	SYSTEM_TAG_UNCATEGORIZED = "_system_tag_uncategorized"
)

type Tag struct {
	Id         string `json:"tag_id"`
	Name       string `json:"name"`
	Favorite   bool   `json:"favorite"`
	TagGroupId string `json:"tag_group_id"`
}

type Tags struct {
	Workspace *Workspace `json:"-"`
	List      []*Tag     `json:"tags"`
}

func NewTags(workspace *Workspace) *Tags {
	tag := new(Tags)
	tag.Workspace = workspace
	tag.Load()
	return tag
}

func (this *Tags) FindTagById(tag_id string) (*Tag, error) {
	for _, t := range this.List {
		if t.Id == tag_id {
			return t, nil
		}
	}

	return nil, errors.New("tagが見つかりませんでした")
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

func (this *Tags) GetFavoriteTags() []*Tag {
	var favorite_tag_list []*Tag
	for _, t := range this.List {
		if t.Favorite {
			favorite_tag_list = append(favorite_tag_list, t)
		}
	}

	return favorite_tag_list
}

func (this *Tags) CreateNewTag(name string) (*Tag, error) {
	tag := new(Tag)
	new_uuid, err := uuid.NewRandom()
	if err != nil {
		return nil, err
	}
	tag.Id = new_uuid.String()
	tag.Name = name
	tag.Favorite = false
	this.List = append(this.List, tag)

	return tag, nil
}

func (this *Tags) UpdateTag(tag_id, name string) error {
	for _, t := range this.List {
		if t.Id == tag_id {
			t.Name = name
			return nil
		}
	}

	return errors.New("The tag_id doesn't exist.")
}

func (this *Tags) DeleteTag(tag_id string) error {
	var new_tag_list []*Tag
	for _, t := range this.List {
		if t.Id != tag_id {
			new_tag_list = append(new_tag_list, t)
		}
	}

	this.List = new_tag_list

	return nil
}

func (this *Tags) AddGroupTag(tag_id string, group_tag_id string) error {
	for _, t := range this.List {
		if t.Id == tag_id {
			t.TagGroupId = group_tag_id
			return nil
		}
	}

	return errors.New("The tag_id doesn't exist.")
}

func (this *Tags) RemoveGroupTag(group_tag_id string) {
	for _, t := range this.List {
		if t.TagGroupId == group_tag_id {
			t.TagGroupId = ""
		}
	}
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
