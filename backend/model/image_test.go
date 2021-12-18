package model

import (
	"fmt"
	"testing"
	"uzume_backend/test_helper"

	"github.com/stretchr/testify/assert"
)

// func TestNewImage(t *testing.T) {
// 	test_helper.InitializeTest()
// }

// func TestFindImageById(t *testing.T) {
// 	test_helper.InitializeTest()
// }

// func TestImage_Load(t *testing.T) {
// 	test_helper.InitializeTest()
// }

// func TestImage_Save(t *testing.T) {
// }

// func TestImage_CreateImageAndSave(t *testing.T) {
// 	test_helper.InitializeTest()
// }

// func TestImage_SearchImages(t *testing.T) {
// 	test_helper.InitializeTest()
// 	ResetImageCache()
// 	_, workspace := FixtureSetupOneWorkspace()

// 	tagA := FixtureCreateTag(workspace, "tagA")
// 	tagB := FixtureCreateTag(workspace, "tagB")
// 	tagC := FixtureCreateTag(workspace, "tagC")

// 	image1, _ := FixtureCreateImage(workspace, "testimage1.png")
// 	image1.CreatedAt = time.Now().Add(2 * time.Second)
// 	image1.Save()
// 	image1.Author = "authorX"
// 	image1.AddTag(tagA.Id)
// 	image1.AddTag(tagB.Id)
// 	image1.Save()
// 	image2, _ := FixtureCreateImage(workspace, "testimage1.png")
// 	image2.CreatedAt = time.Now().Add(1 * time.Second)
// 	image2.Save()
// 	image2.Author = "authorY"
// 	image2.AddTag(tagB.Id)
// 	image2.AddTag(tagC.Id)
// 	image2.Save()

// 	// for i := 0; i < 200; i++ {
// 	// 	image, err := FixtureCreateImage(workspace, "testimage1.png")
// 	// 	if err != nil {
// 	// 		fmt.Println(err.Error())
// 	// 	}
// 	// 	image.CreatedAt = time.Now().Add(time.Duration(-i) * time.Hour)
// 	// 	image.Save()
// 	// 	image.Author = fmt.Sprintf("author%d", i+1)
// 	// 	image.Save()
// 	// }

// 	// タグ検索
// 	images_and, _ := SearchImages(workspace, []string{tagA.Id, tagB.Id}, "and", 1)
// 	assert.Equal(t, []*Image{image1}, images_and)
// 	images_or, _ := SearchImages(workspace, []string{tagA.Id, tagB.Id}, "or", 1)
// 	assert.Equal(t, []*Image{image1, image2}, images_or)

// 	// ページネーション
// 	// images_all1, _ := SearchImages(workspace, []string{}, "", 1)
// 	// assert.Equal(t, 100, len(images_all1))
// 	// assert.Equal(t, "authorX", images_all1[0].Author)

// 	// images_all2, _ := SearchImages(workspace, []string{}, "", 2)
// 	// assert.Equal(t, 100, len(images_all2))
// 	// assert.Equal(t, "author99", images_all2[0].Author)

// 	// images_all3, _ := SearchImages(workspace, []string{}, "", 3)
// 	// assert.Equal(t, 2, len(images_all3))
// 	// assert.Equal(t, "author199", images_all3[0].Author)

// 	// 順番
// 	// image3, _ := FixtureCreateImage(workspace, "testimage1.png")
// 	// image3.CreatedAt = time.Now().Add(3 * time.Second)
// 	// image3.Save()
// 	// image3.Author = "authorZ"
// 	// image3.Save()

// 	// resetSortedImages(workspace)
// 	// images_order, _ := SearchImages(workspace, []string{}, "", 1)
// 	// assert.Equal(t, "authorZ", images_order[0].Author)
// }

func TestImage_HaveTag(t *testing.T) {
	test_helper.InitializeTest()
	_, workspace := FixtureSetupOneWorkspace()
	image := NewImage(workspace)

	tagA := FixtureCreateTag(workspace, "tagA")
	tagB := FixtureCreateTag(workspace, "tagB")

	image.Tags = append(image.Tags, tagA.Id)

	assert.Equal(t, true, image.HaveTag(tagA.Id))
	assert.Equal(t, false, image.HaveTag(tagB.Id))
}

func TestImage_AddTag(t *testing.T) {
	test_helper.InitializeTest()
	_, workspace := FixtureSetupOneWorkspace()
	image := NewImage(workspace)

	tagA := FixtureCreateTag(workspace, "tagA")
	tagB := FixtureCreateTag(workspace, "tagB")

	image.AddTag(tagA.Id)

	assert.Equal(t, true, image.HaveTag(tagA.Id))
	assert.Equal(t, false, image.HaveTag(tagB.Id))
}

func TestImage_RemoveTag(t *testing.T) {
	test_helper.InitializeTest()
	_, workspace := FixtureSetupOneWorkspace()
	image := NewImage(workspace)

	tagA := FixtureCreateTag(workspace, "tagA")
	tagB := FixtureCreateTag(workspace, "tagB")

	image.AddTag(tagA.Id)
	image.AddTag(tagB.Id)

	assert.Equal(t, true, image.HaveTag(tagA.Id))
	assert.Equal(t, true, image.HaveTag(tagB.Id))

	image.RemoveTag(tagB.Id)

	assert.Equal(t, true, image.HaveTag(tagA.Id))
	assert.Equal(t, false, image.HaveTag(tagB.Id))
}

func TestImage_ImageDirName(t *testing.T) {
	test_helper.InitializeTest()
	_, workspace := FixtureSetupOneWorkspace()
	image := NewImage(workspace)
	image.Id = "image_id"
	assert.Equal(t, "image_id.image", image.ImageDirName())
}

func TestImage_ImagesDirPath(t *testing.T) {
	test_helper.InitializeTest()
	_, workspace := FixtureSetupOneWorkspace()
	image := NewImage(workspace)
	assert.Equal(t, fmt.Sprintf("%s/images", workspace.Path), image.ImagesDirPath())
}

func TestImage_ImageJsonPath(t *testing.T) {
	test_helper.InitializeTest()
	_, workspace := FixtureSetupOneWorkspace()
	image := NewImage(workspace)
	image.Id = "image_id"
	assert.Equal(t, fmt.Sprintf("%s/images/image_id.image/imageinfo.json", workspace.Path), image.ImageJsonPath())
}

func TestImage_ImagePath(t *testing.T) {
	test_helper.InitializeTest()
	_, workspace := FixtureSetupOneWorkspace()
	image := NewImage(workspace)
	image.Id = "image_id"
	image.FileName = "name"
	image.Ext = "png"
	assert.Equal(t, fmt.Sprintf("%s/images/image_id.image/name.png", workspace.Path), image.ImagePath(""))
	assert.Equal(t, fmt.Sprintf("%s/images/image_id.image/name_thumb.jpg", workspace.Path), image.ImagePath("thumb"))
	assert.Equal(t, fmt.Sprintf("%s/images/image_id.image/name_some_option.png", workspace.Path), image.ImagePath("some_option"))
}
