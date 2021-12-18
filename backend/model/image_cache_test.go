package model

import (
	"fmt"
	"testing"
	"time"
	"uzume_backend/test_helper"

	"github.com/stretchr/testify/assert"
)

func TestImageCache_toAddTagScenario(t *testing.T) {
	test_helper.InitializeTest()
	ResetImageCache()
	_, workspace := FixtureSetupOneWorkspace()
	workspace.Save()

	tagA := FixtureCreateTag(workspace, "tagA")

	assert.Equal(t, 0, len(g_image_cache))
	image1, _ := FixtureCreateImage(workspace, "testimage1.png")
	image1.CreatedAt = time.Now().Add(-time.Hour)
	image1.AddTag(SYSTEM_TAG_UNCATEGORIZED)
	if err := image1.Save(); err != nil {
		fmt.Println(err)
	}
	// uncategorizedがキャッシュされているか
	assert.Equal(t, 1, len(g_image_cache))
	assert.Equal(t, 1, len(g_image_cache[workspace.Id].SortedImages))
	assert.Equal(t, 1, len(g_image_cache[workspace.Id].IdToImages))
	assert.Equal(t, 1, len(g_image_cache[workspace.Id].TagToImages))
	assert.Equal(t, 1, len(g_image_cache[workspace.Id].TagToImages[SYSTEM_TAG_UNCATEGORIZED]))
	assert.Equal(t, image1.Id, g_image_cache[workspace.Id].SortedImages[0].Id)
	assert.Equal(t, g_image_cache[workspace.Id].SortedImages[0], g_image_cache[workspace.Id].TagToImages[SYSTEM_TAG_UNCATEGORIZED][0])

	image2, _ := FixtureCreateImage(workspace, "testimage1.png")
	image2.CreatedAt = time.Now()
	image2.AddTag(SYSTEM_TAG_UNCATEGORIZED)
	if err := image2.Save(); err != nil {
		fmt.Println(err)
	}
	// image2がuncategorizedとしてキャッシュされているか
	assert.Equal(t, 1, len(g_image_cache))
	assert.Equal(t, 2, len(g_image_cache[workspace.Id].SortedImages))
	assert.Equal(t, 2, len(g_image_cache[workspace.Id].IdToImages))
	assert.Equal(t, 1, len(g_image_cache[workspace.Id].TagToImages))
	assert.Equal(t, 2, len(g_image_cache[workspace.Id].TagToImages[SYSTEM_TAG_UNCATEGORIZED]))
	assert.Equal(t, image2.Id, g_image_cache[workspace.Id].SortedImages[0].Id)
	assert.Equal(t, image1.Id, g_image_cache[workspace.Id].SortedImages[1].Id)
	assert.Equal(t, g_image_cache[workspace.Id].SortedImages[1], g_image_cache[workspace.Id].TagToImages[SYSTEM_TAG_UNCATEGORIZED][0])
	assert.Equal(t, g_image_cache[workspace.Id].SortedImages[0], g_image_cache[workspace.Id].TagToImages[SYSTEM_TAG_UNCATEGORIZED][1])

	image1.AddTag(tagA.Id)
	if err := image1.Save(); err != nil {
		fmt.Println(err)
	}
	// image1がuncategorizedから外れtagAがつくこと
	assert.Equal(t, 1, len(g_image_cache))
	assert.Equal(t, 2, len(g_image_cache[workspace.Id].SortedImages))
	assert.Equal(t, 2, len(g_image_cache[workspace.Id].IdToImages))
	assert.Equal(t, 2, len(g_image_cache[workspace.Id].TagToImages))
	assert.Equal(t, 1, len(g_image_cache[workspace.Id].TagToImages[SYSTEM_TAG_UNCATEGORIZED]))
	assert.Equal(t, 1, len(g_image_cache[workspace.Id].TagToImages[tagA.Id]))
	assert.Equal(t, image2.Id, g_image_cache[workspace.Id].SortedImages[0].Id)
	assert.Equal(t, image1.Id, g_image_cache[workspace.Id].SortedImages[1].Id)
	assert.Equal(t, g_image_cache[workspace.Id].SortedImages[0], g_image_cache[workspace.Id].TagToImages[SYSTEM_TAG_UNCATEGORIZED][0])
	assert.Equal(t, g_image_cache[workspace.Id].SortedImages[1], g_image_cache[workspace.Id].TagToImages[tagA.Id][0])
}
