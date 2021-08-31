package api

import (
	"net/http"
	"uzume_backend/helper"
	"uzume_backend/model"

	"github.com/labstack/echo"
)

func GetTags() echo.HandlerFunc {
	return func(c echo.Context) (err error) {
		workspace_id := helper.LoggedinWrokspaceId(c)
		workspace, err := model.NewWorkspaceById(workspace_id)
		if err != nil {
			return err
		}

		tags := model.NewTags(workspace)

		return c.JSON(http.StatusOK, struct {
			Tags []*model.Tag `json:"tags"`
		}{
			Tags: tags.GetAllTags(),
		})
	}
}

func PostTag() echo.HandlerFunc {
	return func(c echo.Context) (err error) {
		param := new(struct {
			Name string `json:"name"`
		})
		if err := c.Bind(param); err != nil {
			return err
		}

		workspace_id := helper.LoggedinWrokspaceId(c)
		workspace, err := model.NewWorkspaceById(workspace_id)
		if err != nil {
			return err
		}

		tags := model.NewTags(workspace)
		tag, _ := tags.CreateNewTag(param.Name)

		return c.JSON(http.StatusCreated, struct {
			Tag *model.Tag `json:"tag"`
		}{
			Tag: tag,
		})
	}
}

func PatchTag() echo.HandlerFunc {
	return func(c echo.Context) (err error) {
		tag_id := c.Param("id")
		param := new(struct {
			Name string `json:"name"`
		})
		if err := c.Bind(param); err != nil {
			return err
		}

		workspace_id := helper.LoggedinWrokspaceId(c)
		workspace, err := model.NewWorkspaceById(workspace_id)
		if err != nil {
			return err
		}

		tags := model.NewTags(workspace)
		for _, t := range tags.List {
			if t.Id == tag_id {
				t.Name = param.Name
				tags.Save()
				return c.JSON(http.StatusNoContent, "")
			}
		}

		return c.JSON(http.StatusBadRequest, "指定されたtagIDは存在しません")
	}
}

func DeleteTag() echo.HandlerFunc {
	return func(c echo.Context) (err error) {
		tag_id := c.Param("id")

		workspace_id := helper.LoggedinWrokspaceId(c)
		workspace, err := model.NewWorkspaceById(workspace_id)
		if err != nil {
			return err
		}

		tags := model.NewTags(workspace)
		if err := tags.DeleteTag(tag_id); err != nil {
			return err
		}

		return c.JSON(http.StatusNoContent, "")
	}
}
