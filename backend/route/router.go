package route

import (
	"uzume_backend/api"

	"github.com/labstack/echo"
	echoMw "github.com/labstack/echo/middleware"
	"github.com/labstack/gommon/log"
)

func Init() *echo.Echo {
	e := echo.New()
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
		v1.GET("/workspaces", api.GetWorkspaces())
		v1.GET("/workspaces/login", api.GetWorkspacesLogin())
	}

	return e
}
