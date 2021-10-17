FORMAT: 1A

# Data Structures
## Image (object)
+ image_id: `550e8400-e29b-41d4-a716-446655440000` (string)
+ file_name: `IMG0000` (string)
+ ext: `png` (string)
+ memo: `画像についてのメモ` (string)
+ author: `作者名` (string)
+ CreatedAt: `2021-09-19T23:41:17.622003+09:00` (string)
+ tags (array)
    + `550e8400-e29b-41d4-a716-446655440000` (string)

# Group Images

## 画像 [/api/v1/images{?tags,tag_search_type,page}]

### リスト取得 [GET]

#### 処理概要
* 画像情報を取得する
* 画像自体はリンクから改めて取得する
* tag_search_typeにはandかorを指定する
* pageを省略した場合は1ページ目を返す
* 1ページに付きpageは100件
* 最後のページの次のページ以降は0件を返す

+ Parameters
    + tags: `550e8400-e29b-41d4-a716-446655440000,550e8400-e29b-41d4-a716-446655440001` (string)
    + tag_search_type: `and` (string)
    + page: `2` (number)

+ Request (application/json)
    + Headers
        ```
        Authorization: Basic access_token_string
        ```

+ Response 200 (application/json)
    + Attributes
        + query (object)
            + images (array)
                + (Image)
            + page: `2` (number)

+ Response 400 (application/json)
    + Attributes
        + error_message: `エラーの内容` (string)

+ Response 401 (application/json)
    + Attributes
        + message: `Unauthorized` (string)

## 画像1 [/api/v1/images]
### 新規登録 [POST]

#### 処理概要
* 画像の新規登録を行う
* multipart/form-dataで画像と通常の文字などをまとめて通信する

+ Request (multipart/form-data; boundary=------Boundary)
    + Headers
        ```
        Authorization: Basic access_token_string
        ```
    + Body
        ```
        ------Boundary
        Content-Disposition: form-data; name="tags"

        450b2c21-8f8a-4f34-aa16-6a6aa3e7b57c,6657ee81-3a94-4c72-89ef-b1a8c2669efc
        ------Boundary
        Content-Disposition: form-data; name="file"; filename="filename.png"

        [画像バイナリデータ]
        ------Boundary--
        ```

+ Response 200 (application/json)
    + Attributes
        + image_id: `550e8400-e29b-41d4-a716-446655440000` (string)

## 画像 [/api/v1/images/{image_id}]

### 情報更新 [PATCH]

#### 処理概要
* 画像情報の更新を行う

+ Request (application/json)
    + Headers
        ```
        Authorization: Basic access_token_string
        ```
    + Attributes
        + Author: `作者` (string)
        + Memo: `メモ` (string)

+ Response 200 (application/json)
    + Attributes
        + image_id: `550e8400-e29b-41d4-a716-446655440000` (string)

+ Response 401 (application/json)
    + Attributes
        + message: `Unauthorized` (string)

## 画像 [/api/v1/images/{image_id}/file{?image_size}]

### 画像取得 [GET]

#### 処理概要
* 画像自体を取得する

+ Parameters
    + image_id: `550e8400-e29b-41d4-a716-446655440000` (string)
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

