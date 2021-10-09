FORMAT: 1A

# Data Structures
## Tag (object)
+ tag_id: `550e8400-e29b-41d4-a716-446655440000` (string)
+ name: `タグ名`

# Group Tags

## タグ [/api/v1/tags{?type}]

### リスト取得 [GET]

#### 処理概要
* type省略時、すべての通常タグを取得する
* type=favorite時、すべてのfavoriteタグを取得する

+ Parameters
    + type: `favorite` (string)

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

## タグ [/api/v1/tags]

### 新規登録 [POST]

#### 処理概要
* タグを新規作成する

+ Request (application/json)
    + Headers
        ```
        Authorization: Basic access_token_string
        ```
    + Attributes
        + name: `タグ名` (string)

+ Response 200 (application/json)
    + Attributes
        + tag(Tag)

+ Response 400 (application/json)
    + Attributes
        + error_message: `エラーの内容` (string)

+ Response 401 (application/json)
    + Attributes
        + message: `Unauthorized` (string)


## タグ [/api/v1/tags/{tag_id}]

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

+ Response 204 (application/json)

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

+ Response 204 (application/json)

+ Response 400 (application/json)
    + Attributes
        + error_message: `エラーの内容` (string)

+ Response 401 (application/json)
    + Attributes
        + message: `Unauthorized` (string)


## favoriteタグ [/api/v1/tags/{tag_id}/favorite]

### お気に入り登録 [POST]

#### 処理概要
* タグをお気に入りに登録する

+ Parameters
    + tag_id: `550e8400-e29b-41d4-a716-446655440000` (string)

+ Request (application/json)
    + Headers
        ```
        Authorization: Basic access_token_string
        ```

+ Response 201 (application/json)

+ Response 400 (application/json)
    + Attributes
        + error_message: `エラーの内容` (string)

+ Response 401 (application/json)
    + Attributes
        + message: `Unauthorized` (string)

### お気に入り登録解除 [DELETE]

#### 処理概要
* タグをお気に入りから外す

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
