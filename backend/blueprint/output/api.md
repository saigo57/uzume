FORMAT: 1A

# uzume backend api v1

## このドキュメントについて
このドキュメントはuzumeのbackendアプリversion 1の仕様を記載したものです。

## 用語説明
### access_token
ログイン時に取得できる文字列のこと。
ログインが必要な操作をする際は、後述の`access_token_string`を使用してアクセスする。

### access_token_string
`workspace_id:access_token`をbase64でエンコードしたもので、Request headerの`Authorization`に付与する。  

```
access_token_string = base64("96174de5-c33b-f642-b1e3-c514b100e5ee:73b91104b929f6c2cfa2bb43e7c779769665")
print(access_token_string)
OTYxNzRkZTUtYzMzYi1mNjQyLWIxZTMtYzUxNGIxMDBlNWVlOjczYjkxMTA0YjkyOWY2YzJjZmEyYmI0M2U3Yzc3OTc2OTY2NQ==
```
Request headerには下記のように付与する。
```
Authorization: Basic OTYxNzRkZTUtYzMzYi1mNjQyLWIxZTMtYzUxNGIxMDBlNWVlOjczYjkxMTA0YjkyOWY2YzJjZmEyYmI0M2U3Yzc3OTc2OTY2NQ==
```

# Group workspaces

## ログイン [/api/v1/workspaces/login]

### アクセストークン取得 [POST]

#### 処理概要

* アクセストークンを取得する
* トークンの形式はtoken68

* サーバー側でワークスペースへのアクセスを制限したい場合はトークンを返さない

+ Request (application/json)
    + Attributes
        + workspace_id: `550e8400-e29b-41d4-a716-446655440000` (string)

+ Response 200 (application/json)
    + Attributes
        + access_token: `4y2t8h94jzsh89y48` (string)

+ Response 401 (application/json)
    + Attributes
        + error_message: `エラーの内容` (string)


## ワークスペース [/api/v1/workspaces]

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
* ログイン不要
* 下記の`Request`の例では`/path/to/workspace/ワークスペースの名前.uzume`が作成される

+ Request (application/json)
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

+ Request (application/json)
    + Headers
        ```
        Authorization: Basic access_token_string
        ```
    + Attributes
        + name: `ワークスペースの名前` (string)

+ Response 204 (application/json)

+ Response 400 (application/json)
    + Attributes
        + error_message: `エラーメッセージ` (string)

+ Response 401 (application/json)
    + Attributes
        + message: `Unauthorized` (string)


### 削除 [DELETE]

#### 処理概要

* ワークスペースを削除する
* ワークスペースとアプリの連携を切るだけで、ワークスペースディレクトリ自体は削除しない

+ Request (application/json)
    + Headers
        ```
        Authorization: Basic access_token_string
        ```

+ Response 204 (application/json)

+ Response 400 (application/json)
    + Attributes
        + error_message: `エラーメッセージ` (string)

+ Response 401 (application/json)
    + Attributes
        + message: `Unauthorized` (string)


## ワークスペース追加 [/api/v1/workspaces/add]

###　追加　[POST]

#### 処理概要

* 既存のワークスペースを追加する
* ログイン不要

+ Request (application/json)
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

## 画像 [/api/v1/images]

### リスト取得 [GET]

#### 処理概要
* 画像情報を取得する
* 画像自体はリンクから改めて取得する

+ Request (application/json)
    + Headers
        ```
        Authorization: Basic access_token_string
        ```
    + Attributes
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
        + message: `Unauthorized` (string)

### 新規登録 [PATCH]

#### 処理概要
* TODO: 編集中。おそらくmultipart/form-dataを使うが動作確認をしてから記載する
* 画像の新規登録を行う

+ Request (application/json)
    + Headers
        ```
        Authorization: Basic access_token_string
        ```
    + Attributes
        + tags (array)
            + `550e8400-e29b-41d4-a716-446655440000` (string)

+ Response 200 (application/json)
    + Attributes
        + image (Image)

## 画像 [/api/v1/images/{image_id}{?image_size}]

### 画像取得 [GET]

#### 処理概要
* 画像自体を取得する

+ Parameters
    + image_size: `original` (string) - `original, thumbnail`

+ Request (application/json)
    + Headers
        ```
        Authorization: Basic access_token_string
        ```

+ Response 200 (image)

+ Response 400 (application/json)
    + Attributes
        + error_message: `エラーの内容` (string)

+ Response 401 (application/json)
    + Attributes
        + message: `Unauthorized` (string)


## 画像タグ [/api/v1/images/{image_id}/tag]

### 画像にタグを付与 [PATCH]
* 画像に対して一つのタグを付与する

+ Parameters
    + image_id: `550e8400-e29b-41d4-a716-446655440000` (string)

+ Request (application/json)
    + Headers
        ```
        Authorization: Basic access_token_string
        ```
    + Attributes
        + tag_id: `550e8400-e29b-41d4-a716-446655440000`

+ Response 204 (application/json)

+ Response 400 (application/json)
    + Attributes
        + error_message: `エラーメッセージ` (string)

+ Response 401 (application/json)
    + Attributes
        + message: `Unauthorized` (string)


### 画像からタグを削除 [DELETE]
* 画像からタグを一つ削除する

+ Parameters
    + image_id: `550e8400-e29b-41d4-a716-446655440000` (string)

+ Request (application/json)
    + Headers
        ```
        Authorization: Basic access_token_string
        ```
    + Attributes
        + tag_id: `550e8400-e29b-41d4-a716-446655440000`

+ Response 200 (application/json)

+ Response 400 (application/json)
    + Attributes
        + error_message: `エラーメッセージ` (string)

+ Response 401 (application/json)
    + Attributes
        + message: `Unauthorized` (string)


# Data Structures
## Tag (object)
+ tag_id: `550e8400-e29b-41d4-a716-446655440000` (string)
+ name: `タグ名`

# Group Tags

## タグ [/api/v1/tags]

### リスト取得 [GET]

#### 処理概要
* すべての通常タグを取得する

+ Request (application/json)
    + Headers
        ```
        Authorization: Basic access_token_string
        ```

+ Response 200 (application/json)
    + Attributes
        + tags (array)
            + (Tag)

+ Response 400 (application/json)
    + Attributes
        + error_message: `エラーの内容` (string)

+ Response 401 (application/json)
    + Attributes
        + message: `Unauthorized` (string)


## タグ [/api/v1/tags{?tag_id}]

### 変更 [PATCH]

#### 処理概要
* タグの表示名を変更する

+ Parameters
    + tag_id: `550e8400-e29b-41d4-a716-446655440000` (string)

+ Request (application/json)
    + Headers
        ```
        Authorization: Basic access_token_string
        ```
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
        + message: `Unauthorized` (string)

### 削除 [DELETE]

#### 処理概要
* タグを削除する

+ Parameters
    + tag_id: `550e8400-e29b-41d4-a716-446655440000` (string)

+ Request (application/json)
    + Headers
        ```
        Authorization: Basic access_token_string
        ```

+ Response 200 (application/json)

+ Response 400 (application/json)
    + Attributes
        + error_message: `エラーの内容` (string)

+ Response 401 (application/json)
    + Attributes
        + message: `Unauthorized` (string)

