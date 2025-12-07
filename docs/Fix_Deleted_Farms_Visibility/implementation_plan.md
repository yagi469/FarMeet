# 実装計画: 削除済み農園表示の修正

## 1. DTOの作成
JPAエンティティの直接利用を避け、データの転送用オブジェクト (DTO) を導入する。
- `com.farmeet.dto.UserDto`: ユーザー情報の軽量な表現。
- `com.farmeet.dto.FarmDto`: 農園情報の軽量な表現。オーナー情報として `UserDto` を含む。

## 2. AdminServiceの修正
`getDeletedFarms` メソッドの実装を変更する。
- ネイティブクエリで `deleted = true` の農園データを取得。
- 各農園について、オーナー情報を（削除済みも含めて）ネイティブクエリで取得。
- 取得したデータを `FarmDto` に詰め替えてリストとして返す。
- これにより、`@SQLRestriction` によるフィルタリングや、プロキシ解決時の `EntityNotFoundException` を回避する。

## 3. AdminControllerの修正
- `getDeletedFarms` エンドポイントの戻り値を `List<FarmDto>` に変更。

## 4. 検証
- ビルド (`mvn compile`) を実行してコンパイルエラーがないことを確認。
