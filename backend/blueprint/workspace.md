FORMAT: 1A

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

###　追加　[PUT]

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

