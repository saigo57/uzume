FORMAT: 1A

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

## ワークスペースicon [/api/v1/workspaces/icon]

### 取得 [GET]

#### 処理概要

* ワークスペースのアイコン画像を返す
* 404のときはまだiconが登録されていないので、代替画像を出すなどする。

+ Request (application/json)
    + Headers
        ```
        Authorization: Basic access_token_string
        ```
+ Response 200 (image)
+ Response 401 (application/json)
    + Attributes
        + message: `Unauthorized` (string)
+ Response 404 (application/json)

### 更新 [POST]

#### 処理概要

* ワークスペースのアイコン画像を更新する

+ Request (multipart/form-data; boundary=------Boundary)
    + Headers
        ```
        Authorization: Basic access_token_string
        ```
    + Body
        ```
        ------Boundary
        Content-Disposition: form-data; name="icon"; filename="filename.png"

        [画像バイナリデータ]
        ------Boundary--
        ```
+ Response 201 (application/json)
+ Response 401 (application/json)
    + Attributes
        + message: `Unauthorized` (string)



## ワークスペース追加 [/api/v1/workspaces/reflesh_cache]
### キャッシュクリア [POST]

#### 処理概要

* ワークスペースに紐づくキャッシュをすべてクリアする

+ Request (application/json)
    + Headers
        ```
        Authorization: Basic access_token_string
        ```
+ Response 200 (application/json)
+ Response 401 (application/json)
    + Attributes
        + message: `Unauthorized` (string)
