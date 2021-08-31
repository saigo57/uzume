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
	"strings"
	"uzume_backend/helper"

	"github.com/google/uuid"
)

const (
	IMAGE_DIR_EXT = ".image"
)

type Image struct {
	Id        string     `json:"image_id"`
	FileName  string     `json:"file_name"`
	Ext       string     `json:"ext"`
	Tags      []string   `json:"tags"`
	Workspace *Workspace `json:"-"`
}

type ImageCache struct {
	// Tag[tag_id] = []Image
	Images []*Image
	Tag    map[string][]*Image
}

// images_cache[workspace_id] = ImageCache
var images_cache = make(map[string]ImageCache)

func LoadAllImages(workspace *Workspace) error {
	image := NewImage(workspace)
	all, err := ioutil.ReadDir(image.ImagesDirPath())
	if err != nil {
		return err
	}

	cache := new(ImageCache)
	cache.Tag = make(map[string][]*Image)

	for _, f := range all {
		file_name := f.Name()
		if !strings.HasSuffix(file_name, IMAGE_DIR_EXT) {
			continue
		}

		image := NewImage(workspace)
		image.Id = file_name[:len(file_name)-len(IMAGE_DIR_EXT)]
		image.Load()

		cache.Images = append(cache.Images, image)
		// TODO: tagによって振り分ける
	}

	images_cache[workspace.Id] = *cache

	return nil
}

func NewImage(workspace *Workspace) *Image {
	image := new(Image)
	image.Workspace = workspace

	return image
}

func (this *Image) Load() error {
	json_accessor := NewJsonAccessor()
	bytes, err := json_accessor.ReadJson(this.ImageJsonPath())
	if err != nil {
		return err
	}
	if err := json.Unmarshal(bytes, this); err != nil {
		return err
	}

	return nil
}

func (this *Image) Save() error {
	json_path := this.ImageJsonPath()
	json_accessor := NewJsonAccessor()
	if err := json_accessor.SaveJson(json_path, this); err != nil {
		return err
	}

	return nil
}

func (this *Image) CreateImage(img *multipart.FileHeader) error {
	config := new(Config)
	config.Load()

	src, err := img.Open()
	if err != nil {
		return err
	}
	defer src.Close()

	// ID生成
	new_uuid, err := uuid.NewRandom()
	if err != nil {
		return err
	}
	this.Id = new_uuid.String()

	// TODO: 類似画像があるか確認

	ext := filepath.Ext(img.Filename)
	if len(ext) > 1 && ext[0] == '.' {
		this.Ext = ext[1:]
	} else {
		this.Ext = ""
	}
	basename := filepath.Base(img.Filename)
	this.FileName = basename[0 : len(basename)-len(this.Ext)-1]

	// 画像ファイル保存
	file_path := this.ImagePath("")
	dir_path := filepath.Dir(file_path)
	if !helper.DirExists(dir_path) {
		if err := helper.MakeRouteDir(dir_path); err != nil {
			return err
		}
	}
	if err := helper.MakeRouteDir(file_path); err != nil {
		return err
	}

	dst, err := os.Create(file_path)
	if err != nil {
		return err
	}
	defer dst.Close()

	if _, err := io.Copy(dst, src); err != nil {
		return err
	}

	// TODO: サムネイルサイズの画像を作る
	// thumb_file_path := this.ImagePath("thumb")

	this.Save()

	return nil
}

func (this *Image) SearchImages(tag_list []string, search_type string) []*Image {
	images := images_cache[this.Workspace.Id].Images
	if len(tag_list) == 0 {
		return images
	}

	// TODO: このコードはヤバすぎるので仕様が固まったら最適化する
	var ans []*Image
	for _, image := range images {
		if search_type == "and" {
			flg := true
			for _, tag := range tag_list {
				if !image.HaveTag(tag) {
					flg = false
				}
			}
			if flg {
				ans = append(ans, image)
			}
		} else if search_type == "or" {
			for _, tag := range tag_list {
				if image.HaveTag(tag) {
					ans = append(ans, image)
					continue
				}
			}
		}
	}

	return ans
}

func (this *Image) HaveTag(tag_id string) bool {
	for _, tag := range this.Tags {
		if tag == tag_id {
			return true
		}
	}
	return false
}

func (this *Image) AddTag(tag_id string) error {
	for _, tag := range this.Tags {
		if tag == tag_id {
			return errors.New("このタグは既に登録されています")
		}
	}
	this.Tags = append(this.Tags, tag_id)
	this.Save()
	return nil
}

func (this *Image) RemoveTag(tag_id string) {
	var new_tags []string
	for _, tag := range this.Tags {
		if tag == tag_id {
			continue
		}
		new_tags = append(new_tags, tag)
	}
	this.Tags = new_tags
	this.Save()
}

func (this *Image) ImageDirName() string {
	return this.Id + IMAGE_DIR_EXT
}

func (this *Image) ImagesDirPath() string {
	return filepath.Join(this.Workspace.Path, "images")
}

func (this *Image) ImageJsonPath() string {
	return filepath.Join(this.ImagesDirPath(), this.ImageDirName(), "imageinfo.json")
}

func (this *Image) ImagePath(option string) string {
	o := ""
	if len(option) > 0 {
		o = "_" + option
	}
	return filepath.Join(this.ImagesDirPath(), this.ImageDirName(), fmt.Sprintf("%s%s.%s", this.FileName, o, this.Ext))
}
