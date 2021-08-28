FORMAT: 1A

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

