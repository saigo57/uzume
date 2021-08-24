package main

import (
	"uzume_backend/route"
)

func main() {
	router := route.Init()
	router.Logger.Fatal(router.Start(":1323"))
}
