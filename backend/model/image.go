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
	"os"
	"path/filepath"
	"sort"
	"time"
	"uzume_backend/helper"

	"github.com/disintegration/imaging"
	"github.com/google/uuid"
	"golang.org/x/image/draw"
)

const (
	IMAGE_DIR_EXT     = ".image"
	THUMB_HEIGHT_SIZE = 300
	PAGENATION_PER    = 100
)

type Image struct {
	Id        string     `json:"image_id"`
	FileName  string     `json:"file_name"`
	Ext       string     `json:"ext"`
	Width     int        `json:"width"`
	Height    int        `json:"height"`
	Memo      string     `json:"memo"`
	Author    string     `json:"author"`
	CreatedAt time.Time  `json:"created_at"`
	Tags      []string   `json:"tags"`
	Workspace *Workspace `json:"-"`
}

func NewImage(workspace *Workspace) *Image {
	image := new(Image)
	image.Workspace = workspace

	return image
}

func FindImageById(workspace *Workspace, image_id string) (*Image, error) {
	image := NewImage(workspace)
	image.Id = image_id
	if err := image.Load(); err != nil {
		return nil, err
	}

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

	is_update := helper.FileExists(json_path)

	var prev_image *Image
	if is_update {
		// 必ずファイルから取得する
		var err error
		prev_image, err = FindImageById(this.Workspace, this.Id)
		if err != nil {
			return err
		}

		// TODO: 意図しないデータを変更しようとした場合は、差分キャッシュ更新ではなくキャッシュを破棄する
	} else {
		default_time_border, _ := time.Parse("2006/01/02 15:04:05.000", "0002/01/01 00:00:00.000")
		if this.CreatedAt.Before(default_time_border) {
			this.CreatedAt = time.Now()
		}
	}

	json_accessor := NewJsonAccessor()
	if err := json_accessor.SaveJson(json_path, this); err != nil {
		return err
	}

	// キャッシュを更新
	if is_update {
		updateImageCache(this, prev_image)
	} else {
		createImageCache(this)
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
	orig_img, err := imaging.Open(file_path, imaging.AutoOrientation(true))
	this.Width = orig_img.Bounds().Dx()
	this.Height = orig_img.Bounds().Dy()

	thumb_width := int(float64(this.Width) * THUMB_HEIGHT_SIZE / float64(this.Height))
	resizedImg := image.NewRGBA(image.Rect(0, 0, thumb_width, THUMB_HEIGHT_SIZE))
	draw.CatmullRom.Scale(resizedImg, resizedImg.Bounds(), orig_img, orig_img.Bounds(), draw.Over, nil)
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

func sortImageList(image_list []*Image) {
	sort.Slice(image_list, func(i, j int) bool { return image_list[i].CreatedAt.After(image_list[j].CreatedAt) })
}

func SearchImages(workspace *Workspace, tag_list []string, search_type string, page int) ([]*Image, error) {
	pagination := func(image_list []*Image) []*Image {
		begin := (page - 1) * PAGENATION_PER
		if len(image_list) < begin {
			begin = len(image_list)
		}
		end := begin + PAGENATION_PER
		if len(image_list) < end {
			end = len(image_list)
		}

		return image_list[begin:end]
	}

	// tag指定なしの場合全画像を返す
	if len(tag_list) == 0 {
		images, err := getAllImageCache(workspace)
		if err != nil {
			return nil, err
		}

		return pagination(images), nil
	}

	var ans []*Image
	switch search_type {
	case "or":
		s := make(map[*Image]struct{})
		for _, tag_id := range tag_list {
			// タグに紐づくimageリストを取得
			image_list, err := getImageCacheByTagId(workspace, tag_id)
			if err != nil {
				return nil, err
			}

			// mapで重複を解消する
			for _, image := range image_list {
				s[image] = struct{}{}
			}
		}

		for key, _ := range s {
			ans = append(ans, key)
		}
	case "and":
		s := make(map[*Image]int)
		for _, tag_id := range tag_list {
			// タグに紐づくimageリストを取得
			image_list, err := getImageCacheByTagId(workspace, tag_id)
			if err != nil {
				return nil, err
			}

			// 画像がヒットした回数をカウントする
			for _, image := range image_list {
				s[image]++
			}
		}

		tag_count := len(tag_list)

		for key, value := range s {
			// すべてのタグにヒットした画像のみを返す
			if tag_count == value {
				ans = append(ans, key)
			}
		}

	default:
		return nil, errors.New("Unknown search type.")
	}

	sortImageList(ans)
	return pagination(ans), nil
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
