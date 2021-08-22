FORMAT: 1A

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

