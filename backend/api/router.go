package api

import (
	"uzume_backend/model"

	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"
	echoMw "github.com/labstack/echo/middleware"
	"github.com/labstack/gommon/log"
)

func workspaceAuth(workspace_id, token string) (bool, error) {
	access_token := new(model.AccessToken)
	access_token.Load()
	ok, ws_id := access_token.GetWorkspaceId(token)
	if ok && workspace_id == ws_id {
		return true, nil
	}
	return false, nil
}

func RouteInit() *echo.Echo {
	e := echo.New()
	e.Pre(middleware.RemoveTrailingSlash())
	e.Debug = true
	e.Use(echoMw.Logger())
	e.Use(echoMw.Gzip())
	e.Use(echoMw.CORSWithConfig(echoMw.CORSConfig{
		AllowOrigins: []string{"*"},
		AllowHeaders: []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAcceptEncoding},
	}))
	e.Logger.SetLevel(log.DEBUG)

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

			auth.POST("/images", PostImages())
			auth.GET("/images", GetImages())
			auth.GET("/images/:id", GetImageFile())
			auth.PATCH("/images/:id/tags", PatchImageTag())
			auth.DELETE("/images/:image_id/tags/:tag_id", DeleteImageTag())

			auth.GET("/tags", GetTags())
			auth.POST("/tags", PostTag())
			auth.PATCH("/tags/:id", PatchTag())
			auth.DELETE("/tags/:id", DeleteTag())
		}
	}

	return e
}