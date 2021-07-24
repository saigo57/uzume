package main

import (
	"io/ioutil"
	"net/http"

	"github.com/labstack/echo"
)

func main() {
	e := echo.New()
	e.GET("/loadfile", loadfile)
	e.Logger.Fatal(e.Start(":1323"))
}

func loadfile(c echo.Context) error {
	bytes, err := ioutil.ReadFile("./response.txt")
	if err != nil {
		return c.String(http.StatusOK, "error")
	}

	dat := map[string]string{
		"dat": string(bytes),
	}

	return c.JSON(http.StatusOK, dat)
}
