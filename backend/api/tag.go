package api

import (
	"net/http"
	"uzume_backend/helper"
	"uzume_backend/model"

	"github.com/labstack/echo"
)

func GetTags() echo.HandlerFunc {
	return func(c echo.Context) (err error) {
		search_type := c.QueryParam("type")
		workspace_id := helper.LoggedinWrokspaceId(c)

		workspace, err := model.FindWorkspaceById(workspace_id)
		if err != nil {
			return err
		}

		tags := model.NewTags(workspace)

		var tag_list []*model.Tag
		switch search_type {
		case "favorite":
			tag_list = tags.GetFavoriteTags()
		default:
			tag_list = tags.GetAllTags()
		}

		type retTag struct {
			Id         string `json:"tag_id"`
			Name       string `json:"name"`
			Favorite   bool   `json:"favorite"`
			TagGroupId string `json:"tag_group_id"`
		}

		var ret_tags []retTag
		for _, t := range tag_list {
			ret_tags = append(ret_tags, retTag{Id: t.Id, Name: t.Name, Favorite: t.Favorite, TagGroupId: t.TagGroupId})
		}

		return c.JSON(http.StatusOK, struct {
			Tags []retTag `json:"tags"`
		}{
			Tags: ret_tags,
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

		workspace, err := model.FindWorkspaceById(workspace_id)
		if err != nil {
			return err
		}

		tags := model.NewTags(workspace)
		tag, err := tags.CreateNewTag(param.Name)
		if err != nil {
			return err
		}
		if err := tags.Save(); err != nil {
			return err
		}

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

		workspace, err := model.FindWorkspaceById(workspace_id)
		if err != nil {
			return err
		}

		tags := model.NewTags(workspace)
		if err := tags.UpdateTag(tag_id, param.Name); err != nil {
			if err.Error() == "The tag_id doesn't exist." {
				return c.JSON(http.StatusBadRequest, "指定されたtagIDは存在しません")
			}
			return err
		}

		if err := tags.Save(); err != nil {
			return err
		}

		return c.JSON(http.StatusNoContent, "")
	}
}

func DeleteTag() echo.HandlerFunc {
	return func(c echo.Context) (err error) {
		tag_id := c.Param("id")
		workspace_id := helper.LoggedinWrokspaceId(c)

		workspace, err := model.FindWorkspaceById(workspace_id)
		if err != nil {
			return err
		}

		tags := model.NewTags(workspace)
		if err := tags.DeleteTag(tag_id); err != nil {
			return err
		}

		if err := tags.Save(); err != nil {
			return err
		}

		return c.JSON(http.StatusNoContent, "")
	}
}

func AddFavoriteTag() echo.HandlerFunc {
	return func(c echo.Context) (err error) {
		tag_id := c.Param("id")
		workspace_id := helper.LoggedinWrokspaceId(c)

		workspace, err := model.FindWorkspaceById(workspace_id)
		if err != nil {
			return err
		}

		tags := model.NewTags(workspace)
		tag, err := tags.FindTagById(tag_id)
		if err != nil {
			return err
		}

		tag.Favorite = true
		if err := tags.Save(); err != nil {
			return err
		}

		return c.JSON(http.StatusCreated, "")
	}
}

func RemoveFavoriteTag() echo.HandlerFunc {
	return func(c echo.Context) (err error) {
		tag_id := c.Param("id")
		workspace_id := helper.LoggedinWrokspaceId(c)

		workspace, err := model.FindWorkspaceById(workspace_id)
		if err != nil {
			return err
		}

		tags := model.NewTags(workspace)
		tag, err := tags.FindTagById(tag_id)
		if err != nil {
			return err
		}

		tag.Favorite = false
		if err := tags.Save(); err != nil {
			return err
		}

		return c.JSON(http.StatusOK, "")
	}
}
