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
