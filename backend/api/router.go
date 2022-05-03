package api

import (
	"net"
	"net/http"
	"uzume_backend/model"

	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"
	echoMw "github.com/labstack/echo/middleware"
	"github.com/labstack/gommon/log"
)

func SetVersion(version string) {
	g_version_str = version
}

func workspaceAuth(workspace_id, token string) (bool, error) {
	access_token, err := model.NewAccessToken()
	if err != nil {
		return false, err
	}
	ok, ws_id := access_token.GetWorkspaceId(token)
	if ok && workspace_id == ws_id {
		return true, nil
	}
	return false, nil
}

func RouteInit(listener net.Listener) *echo.Echo {
	e := echo.New()
	e.HideBanner = true
	e.Pre(middleware.RemoveTrailingSlash())
	if DEBUG_MODE {
		e.Debug = true
		e.Use(echoMw.Logger())
	}
	e.Use(echoMw.Gzip())
	e.Use(echoMw.CORSWithConfig(echoMw.CORSConfig{
		AllowOrigins: []string{"*"},
		AllowHeaders: []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAcceptEncoding},
	}))
	e.Logger.SetLevel(log.DEBUG)
	e.Listener = listener

	e.GET("/api/version", GetVersion())

	v1 := e.Group("/api/v1")
	{
		v1.GET("/workspaces", GetWorkspaces())
		v1.POST("/workspaces", PostWorkspaces())
		v1.POST("/workspaces/add", PostWorkspacesAdd())
		v1.POST("/workspaces/login", PostWorkspacesLogin())
		auth := v1.Group("")
		auth.Use(middleware.BasicAuth(func(workspace_id, access_token string, c echo.Context) (bool, error) {
			return workspaceAuth(workspace_id, access_token)
		}))
		{
			auth.PATCH("/workspaces", PatchWorkspaces())
			auth.DELETE("/workspaces", DeleteWorkspaces())
			auth.GET("/workspaces/icon", GetWorkspaceIcon())
			auth.POST("/workspaces/icon", PostWorkspaceIcon())
			auth.DELETE("/workspaces/icon", DeleteWorkspaceIcon())
			auth.POST("/workspaces/reflesh_cache", PostWorkspaceRefleshCache())

			auth.POST("/images", PostImages())
			auth.GET("/images", GetImages())
			auth.PATCH("/images/:id", PatchImages())
			auth.GET("/images/:id/file", GetImageFile())
			auth.PATCH("/images/:id/tags", PatchImageTag())
			auth.DELETE("/images/:image_id/tags/:tag_id", DeleteImageTag())

			auth.GET("/tags", GetTags())
			auth.POST("/tags", PostTag())
			auth.PATCH("/tags/:id", PatchTag())
			auth.DELETE("/tags/:id", DeleteTag())
			auth.POST("/tags/:id/favorite", AddFavoriteTag())
			auth.DELETE("/tags/:id/favorite", RemoveFavoriteTag())

			auth.GET("/tag_groups", GetTagGroups())
			auth.POST("/tag_groups", PostTagGroup())
			auth.PATCH("/tag_groups/:id", PatchTagGroup())
			auth.POST("/tag_groups/:id", PostTagToTagGroup())
			auth.DELETE("/tag_groups/:id", DeleteTagToTagGroup())
		}
	}

	if model.IsE2ETest {
		e.POST("/e2etest/resetcache", func(c echo.Context) (err error) {
			model.ResetImageCache()
			return c.JSON(http.StatusOK, "")
		})
	}

	return e
}
