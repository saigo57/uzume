package main

import (
	"fmt"
	"log"
	"net"
	"uzume_backend/api"

	"golang.org/x/net/netutil"
)

var version string

func main() {
	fmt.Printf("uzume backend %s\n", version)

	ln, err := net.Listen("tcp", ":22113")
	if err != nil {
		log.Fatal(err)
	}
	listener := netutil.LimitListener(ln, 10)
	defer listener.Close()
	api.SetVersion(version)
	router := api.RouteInit(listener)
	router.Logger.Fatal(router.Start(""))
}
