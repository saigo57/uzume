package api

import (
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

func GetImages() echo.HandlerFunc {
	return func(c echo.Context) (err error) {
		tag_search_type := c.QueryParam("tag_search_type")
		tags := c.QueryParam("tags")
		var tag_list []string
		for _, tag := range strings.Split(tags, ",") {
			if len(tag) > 0 {
				tag_list = append(tag_list, tag)
			}
		}

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
		tags := c.FormValue("tags")
		author := c.FormValue("author")
		memo := c.FormValue("memo")
		tag_list := strings.Split(tags, ",")

		workspace_id := helper.LoggedinWrokspaceId(c)
		workspace, err := model.NewWorkspaceById(workspace_id)
		if err != nil {
			return err
		}

		image := model.NewImage(workspace)
		if err := image.CreateImage(image_file); err != nil {
			return err
		}

		for _, tag := range tag_list {
			if err := image.AddTag(tag); err != nil {
				return err
			}
		}

		image.Memo = memo
		image.Author = author
		image.CreatedAt = time.Now()
		image.Save()

		if len(tag_list) == 0 {
			//
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
