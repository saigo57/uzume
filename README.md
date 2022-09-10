# uzume

uzumeは理想の画像管理ソフトを目指しているプロジェクトです。<br>
[ランディングページ](https://uzume.amanoiwato.link/)

## 思想
uzumeは、LAN内の1箇所に保存されている画像をPCやスマートフォンで管理できるようにすることを目的としています。<br>
現在はPC版しか存在していませんが、前述のようにスマホアプリも制作する予定です。<br>
そのため、frontendとbackendを分けることでLAN内に存在するマシン1台にbackendを配置、frontendをそれぞれの端末で起動し1箇所のリソースに複数からアクセスできるように設計しています。

## 関連リポジトリ
* [uzumeBackend](https://github.com/Saigo1997/uzume-backend)<br>
Goで作成された、uzumeのバックエンド
* [BackendConnector](https://github.com/Saigo1997/uzume-backend-connector)<br>
uzumeBackendに接続するためのTypeScriptライブラリ
* [uzumeLP](https://github.com/Saigo1997/uzume-LP)<br>
前述のランディングページのソース


# 開発用情報

## ブランチ戦略
* issue番号0を作業する場合、`feature/0`ブランチを作成する。
* 作業が終わったら`main`ブランチに対してPRを作成する。
* PRに`resolves #0`と記載する。(PRがマージされたときにissueを自動でクローズしてくれる。)

## PRを出すときの注意点
`.github/pull_request_template.md`(PRのテンプレート)のチェックリストを確認してください。

