# 実装計画: 初期データ表示問題の修正

## 変更対象ファイル
- `farmeet-backend/src/main/java/com/farmeet/config/DataInitializer.java`

## 変更内容
1. `run` メソッド内で、`farmRepository.count()` に依存せず、ネイティブクエリ `SELECT COUNT(*) FROM farms` を実行して物理的なレコード総数を取得する。
2. 以下のロジックを実装する：
    - **物理レコード数 = 0 の場合**: 既存通り、サンプルデータを新規作成する。
    - **物理レコード数 > 0 かつ 論理レコード数(`farmRepository.count()`) = 0 の場合**: 全ての農園データが論理削除されていると判断し、`UPDATE farms SET deleted = false` および `UPDATE experience_events SET deleted = false` を実行してデータを復元する。
    - **それ以外の場合**: データは既に存在すると判断し、初期化をスキップする。

## 検証方法
1. アプリケーションを起動する。
2. ログに「論理削除された農園データを復元中...」（復元の場合）または「サンプルデータを初期化中...」（新規作成の場合）が表示されることを確認する。
3. フロントエンドで農園一覧が表示されることを確認する。
