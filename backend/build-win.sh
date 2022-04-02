#!/bin/bash

# 準備
# $ brew install create-dmg

APP_VERSION=`cat version`

rm -rf dist/win32/

# winビルド
GOOS=windows GOARCH=amd64 go build -ldflags "-X main.version=`echo $APP_VERSION`" -tags prod -o dist/win32/uzume-server.exe main.go

echo "この後はmsiを作成してください。"
echo "(msi作成ツール: https://github.com/Saigo1997/uzume-build-win-installer)"
echo "その後msiをS3にデプロイしてください。"
