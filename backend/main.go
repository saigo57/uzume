package main

import (
	"fmt"
	"log"
	"net"
	"os"
	"strconv"
	"uzume_backend/api"
	"uzume_backend/model"

	"golang.org/x/net/netutil"
)

var version string

func main() {
	fmt.Printf("uzume backend %s\n", version)

	config, err := model.NewConfig()
	if err != nil {
		fmt.Printf("configファイルの読み込みに失敗しました。\n")
		return
	}

	var port string = "22113"
	switch len(os.Args) {
	case 1:
		if config.ServerPort == 0 {
			// configになかった場合デフォルト値を入れる
			config.ServerPort = 22113
			config.Save()
		}
		port = strconv.Itoa(config.ServerPort)
	case 2:
		port = os.Args[1]
	case 3:
		port = os.Args[1]
		if os.Args[2] == "this-is-e2e-test" {
			model.IsE2ETest = true
			fmt.Println("E2E test mode")
		} else {
			fmt.Println("引数が異常です。")
			return
		}
	default:
		fmt.Printf("コマンドライン引数の数が異常です。\n")
		return
	}

	ln, err := net.Listen("tcp", fmt.Sprintf(":%s", port))
	if err != nil {
		log.Fatal(err)
	}
	listener := netutil.LimitListener(ln, 10)
	defer listener.Close()
	api.SetVersion(version)
	router := api.RouteInit(listener)
	router.Logger.Fatal(router.Start(""))
}
