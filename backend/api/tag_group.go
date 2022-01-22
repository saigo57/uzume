package api

import (
	"net/http"
	"uzume_backend/helper"
	"uzume_backend/model"

	"github.com/labstack/echo"
)

func GetTagGroups() echo.HandlerFunc {
	return func(c echo.Context) (err error) {
		workspace_id := helper.LoggedinWrokspaceId(c)

		workspace, err := model.FindWorkspaceById(workspace_id)
		if err != nil {
			return err
		}

		tag_groups := model.NewTagGroups(workspace)
		tag_group_list := tag_groups.GetAllTagGroups()

		type retTagGroup struct {
			Id   string `json:"tag_group_id"`
			Name string `json:"name"`
		}

		var ret_tag_groups []retTagGroup
		for _, t := range tag_group_list {
			ret_tag_groups = append(ret_tag_groups, retTagGroup{Id: t.Id, Name: t.Name})
		}

		return c.JSON(http.StatusOK, struct {
			Tags []retTagGroup `json:"tag_groups"`
		}{
			Tags: ret_tag_groups,
		})
	}
}

func PostTagGroup() echo.HandlerFunc {
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

		tag_groups := model.NewTagGroups(workspace)
		tag_group, err := tag_groups.CreateNewTagGroup(param.Name)
		if err != nil {
			return err
		}
		if err := tag_groups.Save(); err != nil {
			return err
		}

		return c.JSON(http.StatusCreated, struct {
			Tag *model.TagGroup `json:"tag_group"`
		}{
			Tag: tag_group,
		})
	}
}

func PostTagToTagGroup() echo.HandlerFunc {
	return func(c echo.Context) (err error) {
		tag_group_id := c.Param("id")
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

		tag_groups := model.NewTagGroups(workspace)
		_, err = tag_groups.FindTagGroupById(tag_group_id)
		if err != nil {
			return err
		}

		tags := model.NewTags(workspace)
		if err := tags.AddGroupTag(param.TagId, tag_group_id); err != nil {
			if err.Error() == "The tag_id doesn't exist." {
				return c.JSON(http.StatusBadRequest, "指定されたtagIDは存在しません")
			}
			return err
		}
		if err := tags.Save(); err != nil {
			return err
		}

		return c.JSON(http.StatusCreated, "")
	}
}

func PatchTagGroup() echo.HandlerFunc {
	return func(c echo.Context) (err error) {
		tag_group_id := c.Param("id")
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

		tag_groups := model.NewTagGroups(workspace)
		if err := tag_groups.UpdateTagGroup(tag_group_id, param.Name); err != nil {
			if err.Error() == "The tag_group_id doesn't exist." {
				return c.JSON(http.StatusBadRequest, "指定されたtagGroupIDは存在しません")
			}
			return err
		}

		if err := tag_groups.Save(); err != nil {
			return err
		}

		return c.JSON(http.StatusNoContent, "")
	}
}

func DeleteTagToTagGroup() echo.HandlerFunc {
	return func(c echo.Context) (err error) {
		tag_group_id := c.Param("id")
		workspace_id := helper.LoggedinWrokspaceId(c)

		workspace, err := model.FindWorkspaceById(workspace_id)
		if err != nil {
			return err
		}

		tag_groups := model.NewTagGroups(workspace)
		tag_groups.DeleteTagGroup(tag_group_id)
		if err := tag_groups.Save(); err != nil {
			return err
		}

		tags := model.NewTags(workspace)
		tags.RemoveGroupTag(tag_group_id)
		if err := tags.Save(); err != nil {
			return err
		}

		return c.JSON(http.StatusNoContent, "")
	}
}
