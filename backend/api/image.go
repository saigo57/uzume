package api

import (
	"bytes"
	"io"
	"net/http"
	"strconv"
	"strings"
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
		var page_str = c.QueryParam("page")
		workspace_id := helper.LoggedinWrokspaceId(c)

		workspace, err := model.FindWorkspaceById(workspace_id)
		if err != nil {
			return err
		}

		page, err := strconv.Atoi(page_str)
		if err != nil || page < 1 {
			page = 1
		}

		images, err := model.SearchImages(workspace, tag_list, tag_search_type, page)
		if err != nil {
			if err.Error() == "Unknown search type." {
				return c.JSON(http.StatusBadRequest, helper.ErrorMessage{ErrorMessage: err.Error()})
			}
			return err
		}

		return c.JSON(http.StatusOK, struct {
			Page   int            `json:"page"`
			Images []*model.Image `json:"images"`
		}{
			Page:   page,
			Images: images,
		})
	}
}

func PatchImages() echo.HandlerFunc {
	return func(c echo.Context) (err error) {
		image_id := c.Param("id")
		param := new(struct {
			Author string `json:"author"`
			Memo   string `json:"memo"`
		})
		if err := c.Bind(param); err != nil {
			return err
		}
		workspace_id := helper.LoggedinWrokspaceId(c)

		workspace, err := model.FindWorkspaceById(workspace_id)
		if err != nil {
			return err
		}

		image, err := model.FindImageById(workspace, image_id)
		if err != nil {
			return err
		}
		image.Author = param.Author
		image.Memo = param.Memo
		image.Save()

		return c.JSON(http.StatusOK, image)
	}
}

func GetImageFile() echo.HandlerFunc {
	return func(c echo.Context) (err error) {
		image_id := c.Param("id")
		image_size := c.QueryParam("image_size")
		workspace_id := helper.LoggedinWrokspaceId(c)

		workspace, err := model.FindWorkspaceById(workspace_id)
		if err != nil {
			return err
		}

		image, err := model.FindImageById(workspace, image_id)
		if err != nil {
			return err
		}

		option := ""
		switch image_size {
		case "thumbnail":
			option = "thumb"
		case "original":
			option = ""
		default:
			return c.JSON(http.StatusBadRequest, helper.ErrorMessage{ErrorMessage: "invalid option."})
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

		workspace, err := model.FindWorkspaceById(workspace_id)
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
		if err := image.CreateImageAndSave(image_file.Filename, image_buffer); err != nil {
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
		if err := image.Save(); err != nil {
			return err
		}

		image.Memo = memo
		image.Author = author
		if err := image.Save(); err != nil {
			return err
		}

		if len(tag_list) == 0 {
			if err := image.AddTag(model.SYSTEM_TAG_UNCATEGORIZED); err != nil {
				return err
			}
			if err := image.Save(); err != nil {
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

		workspace, err := model.FindWorkspaceById(workspace_id)
		if err != nil {
			return err
		}

		image, err := model.FindImageById(workspace, image_id)
		if err != nil {
			return err
		}

		if err := image.AddTag(param.TagId); err != nil {
			if err.Error() == "invalid tag_id" || err.Error() == "このタグは既に登録されています" {
				return c.JSON(http.StatusBadRequest, helper.ErrorMessage{ErrorMessage: err.Error()})
			}
			return err
		}
		if err := image.Save(); err != nil {
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

		workspace, err := model.FindWorkspaceById(workspace_id)
		if err != nil {
			return err
		}

		image, err := model.FindImageById(workspace, image_id)
		if err != nil {
			return err
		}
		image.RemoveTag(tag_id)
		if err := image.Save(); err != nil {
			return err
		}

		return c.JSON(http.StatusNoContent, "")
	}
}
