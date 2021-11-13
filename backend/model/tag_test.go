package model

import (
	"io/ioutil"
	"path/filepath"
	"testing"
	"uzume_backend/test_helper"

	"github.com/stretchr/testify/assert"
)

func tagsJsonTestData() string {
	return `
		{
			"tags": [
				{
					"tag_id": "7989a7be-94ce-462a-b05f-e14c30f9e154",
					"name": "tagA",
					"favorite": false
				},
				{
					"tag_id": "a7c0575e-5a69-4fcc-9953-06af90ccd988",
					"name": "tagB",
					"favorite": true
				},
				{
					"tag_id": "46ecec7a-3ce7-47d2-9b81-1df69ee09fd2",
					"name": "tagC",
					"favorite": false
				}
			]
		}`
}

func createWorkspace() *Workspace {
	workspace := new(Workspace)
	workspace.Name = "ワークスペース"
	workspace.Path = test_helper.BuildFilePath("workspace.uzume")
	workspace.CreateWorkspaceDirAndSave()
	return workspace
}

func createTags() *Tags {
	workspace := createWorkspace()
	ioutil.WriteFile(filepath.Join(workspace.Path, "tags.json"), []byte(tagsJsonTestData()), 0644)
	return NewTags(workspace)
}

func TestNewTags(t *testing.T) {
	test_helper.InitializeTest()

	workspace := createWorkspace()
	ioutil.WriteFile(filepath.Join(workspace.Path, "tags.json"), []byte(tagsJsonTestData()), 0644)

	tags := NewTags(workspace)
	assert.Equal(t, 3, len(tags.List))
	assert.Equal(t, "7989a7be-94ce-462a-b05f-e14c30f9e154", tags.List[0].Id)
	assert.Equal(t, "tagA", tags.List[0].Name)
	assert.Equal(t, false, tags.List[0].Favorite)
	assert.Equal(t, "a7c0575e-5a69-4fcc-9953-06af90ccd988", tags.List[1].Id)
	assert.Equal(t, "tagB", tags.List[1].Name)
	assert.Equal(t, true, tags.List[1].Favorite)
	assert.Equal(t, "46ecec7a-3ce7-47d2-9b81-1df69ee09fd2", tags.List[2].Id)
	assert.Equal(t, "tagC", tags.List[2].Name)
	assert.Equal(t, false, tags.List[2].Favorite)
}

func TestFindTagById(t *testing.T) {
	test_helper.InitializeTest()

	tags := createTags()
	tag, _ := tags.FindTagById("46ecec7a-3ce7-47d2-9b81-1df69ee09fd2")
	assert.Equal(t, "46ecec7a-3ce7-47d2-9b81-1df69ee09fd2", tag.Id)
	assert.Equal(t, "tagC", tag.Name)
	assert.Equal(t, false, tag.Favorite)

	_, err := tags.FindTagById("invalid-id")
	assert.Equal(t, "tagが見つかりませんでした", err.Error())
}

// func TestTag_Load(t *testing.T) {
// }

func TestTag_Save(t *testing.T) {
	tags := createTags()
	assert.Equal(t, 3, len(tags.List))
	assert.Equal(t, "tagA", tags.List[0].Name)

	other_tags := new(Tags)
	other_tags.Workspace = tags.Workspace

	tags.List[0].Name = "tagZ"

	other_tags.Load()
	assert.Equal(t, 3, len(other_tags.List))
	assert.Equal(t, "tagA", other_tags.List[0].Name)

	tags.Save()
	other_tags.Load()
	assert.Equal(t, "tagZ", other_tags.List[0].Name)
}

func TestTag_GetAllTags(t *testing.T) {
	tags := createTags()
	assert.Equal(t, tags.List, tags.GetAllTags())
}

func TestTag_GetFavoriteTags(t *testing.T) {
	tags := createTags()
	fav_tags := tags.GetFavoriteTags()
	assert.Equal(t, 1, len(fav_tags))
	assert.Equal(t, "tagB", fav_tags[0].Name)
}

func TestTag_CreateNewTag(t *testing.T) {
	tags := createTags()
	assert.Equal(t, 3, len(tags.List))
	tag_d, _ := tags.CreateNewTag("tagD")

	assert.Equal(t, 36, len(tag_d.Id))
	assert.Equal(t, "tagD", tag_d.Name)
	assert.Equal(t, false, tag_d.Favorite)

	assert.Equal(t, 4, len(tags.List))
	assert.Equal(t, tag_d, tags.List[3])
}

func TestTag_UpdateTag(t *testing.T) {
	tags := createTags()
	assert.Equal(t, 3, len(tags.List))

	tags.UpdateTag(tags.List[0].Id, "tagAdash")
	assert.Equal(t, "tagAdash", tags.List[0].Name)
	assert.Equal(t, "tagB", tags.List[1].Name)
	assert.Equal(t, "tagC", tags.List[2].Name)
}

func TestTag_DeleteTag(t *testing.T) {
	tags := createTags()
	assert.Equal(t, 3, len(tags.List))

	tags.DeleteTag(tags.List[1].Id)
	assert.Equal(t, 2, len(tags.List))
	assert.Equal(t, "tagA", tags.List[0].Name)
	assert.Equal(t, "tagC", tags.List[1].Name)
}

func TestTag_TagsJsonPath(t *testing.T) {
	tags := createTags()
	assert.Equal(t, filepath.Join(tags.Workspace.Path, "tags.json"), tags.TagsJsonPath())
}

func TestTag_IsValidTag(t *testing.T) {
	tags := createTags()
	assert.Equal(t, true, tags.IsValidTag("_system_tag_uncategorized"))
	assert.Equal(t, true, tags.IsValidTag(tags.List[0].Id))
	assert.Equal(t, false, tags.IsValidTag("invalid-tag-id-for-test"))
	assert.Equal(t, false, tags.IsValidTag("_system_tag_invalid_tag_name_for_test"))
}

func TestTag_IsSystemTag(t *testing.T) {
	tags := createTags()
	assert.Equal(t, true, IsSystemTag("_system_tag_uncategorized"))
	assert.Equal(t, false, IsSystemTag(tags.List[0].Id))
	assert.Equal(t, false, IsSystemTag("invalid-tag-id-for-test"))
	assert.Equal(t, false, IsSystemTag("_system_tag_invalid_tag_name_for_test"))
}
