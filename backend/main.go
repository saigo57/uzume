package main

import (
	"uzume_backend/api"
)

func main() {
	router := api.RouteInit()
	router.Logger.Fatal(router.Start(":1323"))
}
