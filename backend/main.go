package main

import (
	"log"
	"net"
	"uzume_backend/api"

	"golang.org/x/net/netutil"
)

func main() {
	ln, err := net.Listen("tcp", ":22113")
	if err != nil {
		log.Fatal(err)
	}
	listener := netutil.LimitListener(ln, 1)
	defer listener.Close()
	router := api.RouteInit(listener)
	router.Logger.Fatal(router.Start(""))
}
