<!--
マージ時に削除しない場合はresolvesの代わりにissueを使う
複数のissueに紐付けたい場合はresolves #0, resolves #0のようにできる
-->
resolves #0

## チェックリスト
- [ ] ライブラリを更新したとき、`npm run generate-notice`で`NOTICE`を更新する
- [ ] `backend/blueprint`以下を編集したとき、`backend/blueprint/converter.sh`を実行し、生成される`docs/index.html`をコミットに含める
