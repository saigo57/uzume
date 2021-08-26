FORMAT: 1A

# uzume backend api v1

## このドキュメントについて
このドキュメントはuzumeのbackendアプリversion 1の仕様を記載したものです。

## TODO:用語説明
### アクセストークン
アクセストークンとは...

# Group workspaces

## ログイン [/v1/workspaces/login]

### アクセストークン取得 [GET]

#### 処理概要

* アクセストークンを取得する
* トークンの形式はtoken68

* サーバー側でワークスペースへのアクセスを制限したい場合はトークンを返さない

+ Request (text/json)
    + Attributes
        + workspace_id: `550e8400-e29b-41d4-a716-446655440000` (string)

+ Response 200 (application/json)
    + Attributes
        + access_token: `4y2t8h94jzsh89y48` (string)

+ Response 401 (application/json)
    + Attributes
        + error_message: `エラーの内容` (string)


## ワークスペース [/v1/workspaces]

### 一覧取得 [GET]

#### 処理概要

* 登録しているワークスペースのリストを返す。

+ Response 200 (application/json)
    + Attributes
        + workspaces (array)
            + (object)
                + workspace_id: `550e8400-e29b-41d4-a716-446655440000` (string)
                + name: `ワークスペースの名前` (string)
                + available: true (boolean)

### 新規作成 [POST]

#### 処理概要

* ワークスペースを新規作成する
* 下記の`Request`の例では`/path/to/workspace/ワークスペースの名前.uzume`が作成される


+ Request (text/json)
    + Attributes
        + name: `ワークスペースの名前` (string)
        + path: `/path/to/workspace` (string)

+ Response 201 (application/json)
    + Attributes
        + workspace_id: `550e8400-e29b-41d4-a716-446655440000` (string)

+ Response 400 (application/json)
    + Attributes
        + error_message: `エラーメッセージ` (string)

### 編集 [PATCH]

#### 処理概要

* ワークスペースの情報を更新する

+ Request (text/json)
    + Attributes
        + access_token: `4y-2t8.h9_4j~zsh_89/y48=` (string)
        + name: `ワークスペースの名前` (string)

+ Response 204 (application/json)

+ Response 400 (application/json)
    + Attributes
        + error_message: `エラーメッセージ` (string)

+ Response 401 (application/json)
    + Attributes
        + error_message: `エラーメッセージ` (string)


### 削除 [DELETE]

#### 処理概要

* ワークスペースを削除する
* ワークスペースとアプリの連携を切るだけで、ワークスペースアプリは削除しない

+ Request (text/json)
    + Attributes
        + access_token: `4y2t8h94jzsh89y48` (string)
        + name: `ワークスペースの名前` (string)

+ Response 204 (application/json)

+ Response 400 (application/json)
    + Attributes
        + error_message: `エラーメッセージ` (string)

+ Response 401 (application/json)
    + Attributes
        + error_message: `エラーメッセージ` (string)


## ワークスペース追加 [/v1/workspaces/add]

###　追加　[POST]

#### 処理概要

* 既存のワークスペースを追加する

+ Request (text/json)
    + Attributes
        + workspace_path: `/path/to/workspace/既存ワークスペース.uzume` (string)

+ Response 204 (application/json)
    + Attributes
        + workspace_id: `550e8400-e29b-41d4-a716-446655440000` (string)

+ Response 400 (application/json)
    + Attributes
        + error_message: `エラーメッセージ` (string)


# Data Structures
## Image (object)
+ image_id: `550e8400-e29b-41d4-a716-446655440000` (string)
+ url: `localhost:3000/image/550e8400-e29b-41d4-a716-446655440000` (string)
+ tags (array)
    + `550e8400-e29b-41d4-a716-446655440000` (string)

# Group Images

## 画像 [/v1/images]

### リスト取得 [GET]

#### 処理概要
* 画像情報を取得する
* 画像自体はリンクから改めて取得する

+ Request (text/json)
    + Attributes
        + access_token: `4y2t8h94jzsh89y48` (string)
        + query (object)
            + tags (array)
                + `550e8400-e29b-41d4-a716-446655440000` (string)
            + tag_search_type: `and` (string)
            + count: 100 (number)
            + offset: 100 (number)

+ Response 200 (application/json)
    + Attributes
        + query (object)
            + count: 100 (number)
            + offset: 100 (number)
            + images (array)
                + (Image)

+ Response 400 (application/json)
    + Attributes
        + error_message: `エラーの内容` (string)

+ Response 401 (application/json)
    + Attributes
        + error_message: `エラーの内容` (string)

### 新規登録 [PATCH]

#### 処理概要
* TODO: 編集中。おそらくmultipart/form-dataを使うが動作確認をしてから記載する
* 画像の新規登録を行う

+ Request (text/json)
    + Attributes
        + access_token: `4y2t8h94jzsh89y48` (string)
        + tags (array)
            + `550e8400-e29b-41d4-a716-446655440000` (string)

+ Response 200 (application/json)
    + Attributes
        + image (Image)

## 画像 [/v1/images/{image_id}{?image_size}]

### 画像取得 [GET]

#### 処理概要
* 画像自体を取得する

+ Parameters
    + image_size: `original` (string) - `original, thumbnail`

+ Request (text/json)
    + Attributes
        + access_token: `4y2t8h94jzsh89y48` (string)

+ Response 200 (image)

+ Response 400 (application/json)
    + Attributes
        + error_message: `エラーの内容` (string)

+ Response 401 (application/json)
    + Attributes
        + error_message: `エラーの内容` (string)


## 画像タグ [/v1/images/{image_id}/tag]

### 画像にタグを付与 [PATCH]
* 画像に対して一つのタグを付与する

+ Parameters
    + image_id: `550e8400-e29b-41d4-a716-446655440000` (string)

+ Request (text/json)
    + Attributes
        + access_token: `4y2t8h94jzsh89y48` (string)
        + tag_id: `550e8400-e29b-41d4-a716-446655440000`

+ Response 204 (application/json)

+ Response 400 (application/json)
    + Attributes
        + error_message: `エラーメッセージ` (string)

+ Response 401 (application/json)
    + Attributes
        + error_message: `エラーメッセージ` (string)


### 画像からタグを削除 [DELETE]
* 画像からタグを一つ削除する

+ Parameters
    + image_id: `550e8400-e29b-41d4-a716-446655440000` (string)

+ Request (text/json)
    + Attributes
        + access_token: `4y2t8h94jzsh89y48` (string)
        + tag_id: `550e8400-e29b-41d4-a716-446655440000`

+ Response 200 (application/json)

+ Response 400 (application/json)
    + Attributes
        + error_message: `エラーメッセージ` (string)

+ Response 401 (application/json)
    + Attributes
        + error_message: `エラーメッセージ` (string)


# Data Structures
## Tag (object)
+ tag_id: `550e8400-e29b-41d4-a716-446655440000` (string)
+ name: `タグ名`

# Group Tags

## タグ [/v1/tags]

### リスト取得 [GET]

#### 処理概要
* すべての通常タグを取得する

+ Request (text/json)
    + Attributes
        + access_token: `4y2t8h94jzsh89y48` (string)

+ Response 200 (application/json)
    + Attributes
        + tags (array)
            + (Tag)

+ Response 400 (application/json)
    + Attributes
        + error_message: `エラーの内容` (string)

+ Response 401 (application/json)
    + Attributes
        + error_message: `エラーの内容` (string)


## タグ [/v1/tags{?tag_id}]

### 変更 [PATCH]

#### 処理概要
* タグの表示名を変更する

+ Parameters
    + tag_id: `550e8400-e29b-41d4-a716-446655440000` (string)

+ Request (text/json)
    + Attributes
        + name: `新タグ名` (string)

+ Response 200 (application/json)
    + Attributes
        + tag (Tag)

+ Response 400 (application/json)
    + Attributes
        + error_message: `エラーの内容` (string)

+ Response 401 (application/json)
    + Attributes
        + error_message: `エラーの内容` (string)

### 削除 [DELETE]

#### 処理概要
* タグを削除する

+ Parameters
    + tag_id: `550e8400-e29b-41d4-a716-446655440000` (string)

+ Request (text/json)
    + Attributes
        + access_token: `4y2t8h94jzsh89y48` (string)

+ Response 200 (application/json)

+ Response 400 (application/json)
    + Attributes
        + error_message: `エラーの内容` (string)

+ Response 401 (application/json)
    + Attributes
        + error_message: `エラーの内容` (string)

