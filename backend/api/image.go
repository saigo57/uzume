package api

import (
	"bytes"
	"io"
	"net/http"
	"strings"
	"time"
	"uzume_backend/helper"
	"uzume_backend/model"

	"github.com/labstack/echo"
)

type ImageResponse struct {
	ImageId string   `json:"image_id"`
	Tags    []string `json:"tags"`
}

func GetQueryParamTags(tags string) []string {
	var tag_list []string
	for _, tag := range strings.Split(tags, ",") {
		if len(tag) > 0 {
			tag_list = append(tag_list, tag)
		}
	}

	return tag_list
}

func GetImages() echo.HandlerFunc {
	return func(c echo.Context) (err error) {
		tag_search_type := c.QueryParam("tag_search_type")
		var tag_list = GetQueryParamTags(c.QueryParam("tags"))

		workspace_id := helper.LoggedinWrokspaceId(c)
		workspace, err := model.NewWorkspaceById(workspace_id)
		if err != nil {
			return err
		}

		model.LoadAllImages(workspace) // TODO: 更新時にcacheも適切に更新できたら削除

		image := model.NewImage(workspace)

		return c.JSON(http.StatusOK, struct {
			Images []*model.Image `json:"images"`
		}{
			Images: image.SearchImages(tag_list, tag_search_type),
		})
	}
}

func GetImageFile() echo.HandlerFunc {
	return func(c echo.Context) (err error) {
		image_id := c.Param("id")
		image_size := c.QueryParam("image_size")

		workspace_id := helper.LoggedinWrokspaceId(c)
		workspace, err := model.NewWorkspaceById(workspace_id)
		if err != nil {
			return err
		}

		image := model.NewImage(workspace)
		image.Id = image_id
		image.Load()

		option := ""
		switch image_size {
		case "thumb":
			option = "thumb"
		default:
			option = ""
		}

		return c.File(image.ImagePath(option))
	}
}

func PostImages() echo.HandlerFunc {
	return func(c echo.Context) (err error) {
		image_file, err := c.FormFile("image")
		if err != nil {
			return err
		}
		author := c.FormValue("author")
		memo := c.FormValue("memo")
		var tag_list = GetQueryParamTags(c.FormValue("tags"))

		workspace_id := helper.LoggedinWrokspaceId(c)
		workspace, err := model.NewWorkspaceById(workspace_id)
		if err != nil {
			return err
		}

		image := model.NewImage(workspace)

		src, err := image_file.Open()
		if err != nil {
			return err
		}
		defer src.Close()
		image_buffer := new(bytes.Buffer)
		if _, err := io.Copy(image_buffer, src); err != nil {
			return err
		}
		if err := image.CreateImage(image_file.Filename, image_buffer); err != nil {
			return err
		}

		for _, tag := range tag_list {
			if err := image.AddTag(tag); err != nil {
				if err.Error() == "invalid tag_id" {
					return c.JSON(http.StatusBadRequest, helper.ErrorMessage{ErrorMessage: err.Error()})
				}
				return err
			}
		}

		image.Memo = memo
		image.Author = author
		image.CreatedAt = time.Now()
		image.Save()

		if len(tag_list) == 0 {
			if err := image.AddTag(model.SYSTEM_TAG_UNCATEGORIZED); err != nil {
				if err.Error() == "invalid tag_id" {
					return c.JSON(http.StatusBadRequest, helper.ErrorMessage{ErrorMessage: err.Error()})
				}
				return err
			}
		}

		return c.JSON(http.StatusCreated, struct {
			ImageId string `json:"image_id"`
		}{
			ImageId: image.Id,
		})
	}
}

func PatchImageTag() echo.HandlerFunc {
	return func(c echo.Context) (err error) {
		image_id := c.Param("id")
		param := new(struct {
			TagId string `json:"tag_id"`
		})
		if err := c.Bind(param); err != nil {
			return err
		}

		workspace_id := helper.LoggedinWrokspaceId(c)
		workspace, err := model.NewWorkspaceById(workspace_id)
		if err != nil {
			return err
		}

		image := model.NewImage(workspace)
		image.Id = image_id
		image.Load()
		if err := image.AddTag(param.TagId); err != nil {
			if err.Error() == "invalid tag_id" || err.Error() == "このタグは既に登録されています" {
				return c.JSON(http.StatusBadRequest, helper.ErrorMessage{ErrorMessage: err.Error()})
			}
			return err
		}

		return c.JSON(http.StatusNoContent, "")
	}
}

func DeleteImageTag() echo.HandlerFunc {
	return func(c echo.Context) (err error) {
		image_id := c.Param("image_id")
		tag_id := c.Param("tag_id")
		workspace_id := helper.LoggedinWrokspaceId(c)
		workspace, err := model.NewWorkspaceById(workspace_id)
		if err != nil {
			return err
		}

		image := model.NewImage(workspace)
		image.Id = image_id
		image.Load()
		image.RemoveTag(tag_id)

		return c.JSON(http.StatusNoContent, "")
	}
}
