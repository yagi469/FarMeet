# Farm URL UUID化

## バックエンド
- [x] `Farm.java` に `publicId` (UUID) フィールドを追加
- [x] `FarmRepository` に `findByPublicId` メソッドを追加
- [x] `FarmService` に UUID検索メソッドを追加
- [x] `FarmController` に `/p/{publicId}` エンドポイントを追加
- [x] `FarmDto` に `publicId` を追加

## フロントエンド
- [x] `api.ts` に `getFarmByPublicId` を追加
- [x] `types/index.ts` の `Farm` 型に `publicId` を追加
- [x] `farms/[id]/page.tsx` をUUID対応に変更
- [x] 各所の農園リンクを `publicId` ベースに変更

## 検証
- [x] 新規農園作成時にUUID生成を確認
- [x] UUID URLでアクセス確認
