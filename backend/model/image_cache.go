package model

import (
	"fmt"
	"io/ioutil"
	"strings"
)

type imageCache struct {
	Images      []*Image
	IdToImages  map[string]*Image   // map[image_id]
	TagToImages map[string][]*Image // map[tag_id]
}

var g_image_cache = make(map[string]*imageCache) // map[workspace_id]

func getImageCache(workspace_id string) *imageCache {
	if g_image_cache[workspace_id] == nil {
		g_image_cache[workspace_id] = new(imageCache)
	}

	if g_image_cache[workspace_id].IdToImages == nil {
		g_image_cache[workspace_id].IdToImages = make(map[string]*Image)
	}

	if g_image_cache[workspace_id].TagToImages == nil {
		g_image_cache[workspace_id].TagToImages = make(map[string][]*Image)
	}

	return g_image_cache[workspace_id]
}

func isImageCacheExist(workspace *Workspace) bool {
	_, cache_exists := g_image_cache[workspace.Id]
	return cache_exists
}

func getAllImageCache(workspace *Workspace) ([]*Image, error) {
	if !isImageCacheExist(workspace) {
		if err := refleshImageCache(workspace); err != nil {
			return nil, err
		}
	}

	return g_image_cache[workspace.Id].Images, nil
}

func getImageCacheByTagId(workspace *Workspace, tag_id string) ([]*Image, error) {
	if !isImageCacheExist(workspace) {
		if err := refleshImageCache(workspace); err != nil {
			return nil, err
		}
	}

	return g_image_cache[workspace.Id].TagToImages[tag_id], nil
}

func createImageCache(image *Image) {
	if !isImageCacheExist(image.Workspace) {
		if err := refleshImageCache(image.Workspace); err != nil {
			// 失敗した場合は、一旦キャッシュを放棄する
			destroyImageCache(image.Workspace)
			return
		}
	}

	image_cache := getImageCache(image.Workspace.Id)

	image_cache.Images = append(image_cache.Images, image)
	image_cache.IdToImages[image.Id] = image
	for _, tag_id := range image.Tags {
		image_cache.TagToImages[tag_id] = append(image_cache.TagToImages[tag_id], image)
	}
}

func updateImageCache(image *Image, prev_image *Image) {
	if !isImageCacheExist(image.Workspace) {
		if err := refleshImageCache(image.Workspace); err != nil {
			// 失敗した場合は、一旦キャッシュを放棄する
			destroyImageCache(image.Workspace)
			return
		}
	}

	image_cache := getImageCache(image.Workspace.Id)

	// image自体の内容を更新
	*(image_cache.IdToImages[image.Id]) = *image

	// 増えたタグについての処理
	for _, next_tag_id := range image.Tags {
		is_added := true
		for _, prev_tag_id := range prev_image.Tags {
			if next_tag_id == prev_tag_id {
				is_added = false
				break
			}
		}

		if is_added {
			image_cache.TagToImages[next_tag_id] = append(image_cache.TagToImages[next_tag_id], image)
		}
	}

	// 消えたタグについての処理
	for _, prev_tag_id := range prev_image.Tags {
		is_deleted := true
		for _, next_tag_id := range image.Tags {
			if next_tag_id == prev_tag_id {
				is_deleted = false
				break
			}
		}

		if is_deleted {
			var new_images []*Image
			for _, i := range image_cache.TagToImages[prev_tag_id] {
				if image.Id != i.Id {
					new_images = append(new_images, image)
				}
			}
			image_cache.TagToImages[prev_tag_id] = new_images
		}
	}
}

func refleshImageCache(workspace *Workspace) error {
	image := NewImage(workspace)
	all_image_files, err := ioutil.ReadDir(image.ImagesDirPath())
	if err != nil {
		return err
	}

	cache := new(imageCache)
	cache.TagToImages = make(map[string][]*Image)

	for _, f := range all_image_files {
		file_name := f.Name()
		if !strings.HasSuffix(file_name, IMAGE_DIR_EXT) {
			continue
		}

		image_id := file_name[:len(file_name)-len(IMAGE_DIR_EXT)]
		image, err := FindImageById(workspace, image_id)
		if err != nil {
			return err
		}

		cache.Images = append(cache.Images, image)
		for _, t := range image.Tags {
			cache.TagToImages[t] = append(cache.TagToImages[t], image)
		}
	}

	g_image_cache[workspace.Id] = cache

	return nil
}

func destroyImageCache(workspace *Workspace) {
	delete(g_image_cache, workspace.Id)
	fmt.Printf("[LOG] delete image cache workspace.Id=%s\n", workspace.Id)
}
