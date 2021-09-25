package model

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"image"
	_ "image/gif"
	"image/jpeg"
	_ "image/png"
	"io"
	"io/ioutil"
	"os"
	"path/filepath"
	"strings"
	"time"
	"uzume_backend/helper"

	"github.com/google/uuid"
	"github.com/nfnt/resize"
)

const (
	IMAGE_DIR_EXT     = ".image"
	THUMB_HEIGHT_SIZE = 300
)

type Image struct {
	Id        string     `json:"image_id"`
	FileName  string     `json:"file_name"`
	Ext       string     `json:"ext"`
	Memo      string     `json:"memo"`
	Author    string     `json:"author"`
	CreatedAt time.Time  `json:"created_at"`
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

func FindImageById(workspace *Workspace, image_id string) (*Image, error) {
	image := NewImage(workspace)
	image.Id = image_id
	image.Load()

	return image, nil
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

func (this *Image) CreateImageAndSave(file_name string, image_buffer *bytes.Buffer) error {
	// ID生成
	new_uuid, err := uuid.NewRandom()
	if err != nil {
		return err
	}
	this.Id = new_uuid.String()

	// TODO: 類似画像があるか確認

	file_name, ext := helper.SplitFileNameAndExt(file_name)
	this.FileName = file_name
	this.Ext = ext

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

	if _, err := io.Copy(dst, image_buffer); err != nil {
		return err
	}

	// サムネイルサイズの画像を作る
	thumb_file_path := this.ImagePath("thumb")
	org_file_data, err := os.Open(file_path)
	if err != nil {
		return err
	}

	thumb_img, _, err := image.Decode(org_file_data)
	if err != nil {
		return err
	}

	resizedImg := resize.Resize(0, THUMB_HEIGHT_SIZE, thumb_img, resize.NearestNeighbor)
	output, err := os.Create(thumb_file_path)
	if err != nil {
		return err
	}
	defer output.Close()

	opts := &jpeg.Options{Quality: 85}
	if err := jpeg.Encode(output, resizedImg, opts); err != nil {
		return err
	}

	return this.Save()
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
	tags := NewTags(this.Workspace)
	if !tags.IsValidTag(tag_id) {
		return errors.New("invalid tag_id")
	}
	var new_tag_list []string
	for _, tag := range this.Tags {
		if tag == tag_id {
			return errors.New("このタグは既に登録されています")
		}
		if !IsSystemTag(tag) {
			new_tag_list = append(new_tag_list, tag)
		}
	}
	new_tag_list = append(new_tag_list, tag_id)
	this.Tags = new_tag_list
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
	ext := this.Ext
	if option == "thumb" {
		ext = "jpg"
	}
	return filepath.Join(this.ImagesDirPath(), this.ImageDirName(), fmt.Sprintf("%s%s.%s", this.FileName, o, ext))
}
