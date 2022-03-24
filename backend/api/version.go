package api

import (
	"net/http"

	"github.com/labstack/echo"
)

func GetVersion() echo.HandlerFunc {
	return func(c echo.Context) (err error) {
		type ResVersion struct {
			Version string `json:"version"`
		}

		return c.JSON(http.StatusOK, ResVersion{Version: "0.0.1"})
	}
}
