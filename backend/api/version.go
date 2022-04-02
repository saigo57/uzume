package api

import (
	"io/ioutil"
	"net/http"
	"os"
	"path/filepath"

	"github.com/labstack/echo"
)

var g_version_str string

func GetVersion() echo.HandlerFunc {
	return func(c echo.Context) (err error) {
		type ResVersion struct {
			Version string `json:"version"`
		}

		var ver = g_version_str

		if DEBUG_MODE {
			project_root := os.Getenv("PROJECT_ROOT")
			bytes, err := ioutil.ReadFile(filepath.Join(project_root, "/backend/version"))
			if err != nil {
				panic(err)
			}

			ver = string(bytes)
		}

		return c.JSON(http.StatusOK, ResVersion{Version: ver})
	}
}
