#!/bin/bash

# 準備
# $ brew install create-dmg

APP_VERSION=`cat version`

rm -rf dist/mac/

# macビルド
GOOS=darwin GOARCH=amd64 go build -ldflags "-X main.version=`echo $APP_VERSION`" -tags prod -o dist/mac/uzume-server.app main.go

# コードサイニング署名
codesign --force --verify --verbose \
  --sign "$DEVELOPER_ID_APPLICATION" \
  "dist/mac/uzume-server.app" \
  --deep \
  --options runtime \
  --entitlements entitlements.mac.plist \
  --timestamp

cd dist/mac/

# インストーラーDMG作成
DMG_NAME=uzume-server-`echo $APP_VERSION`.dmg
create-dmg \
  --volname "uzume-server-`echo $APP_VERSION`" \
  --window-pos 200 120 \
  --window-size 800 400 \
  --icon-size 100 \
  --icon "uzume-server.app" 200 190 \
  --hide-extension "uzume-server.app" \
  --app-drop-link 600 185 \
  "`echo $DMG_NAME`" \
  "source_folder/"

# 公証
xcrun notarytool submit `echo $DMG_NAME` \
  --apple-id "`echo $APPLEID`" \
  --password `echo $APPLEIDPASS` \
  --team-id `echo $ASC_PROVIDER`

# s3にアップロード
aws s3 cp \
  `echo $DMG_NAME` \
  s3://uzume-prod/deploy/backend/darwin/`echo $DMG_NAME` \
  --acl public-read

cd ../../
