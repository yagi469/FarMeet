# Farm URL UUID化 - Walkthrough

## 実装概要

農園のURLを連番ID（`/farms/1`）からUUID（`/farms/550e8400-e29b-...`）に変更。外部からIDの推測が不可能になりました。

## 変更ファイル

### バックエンド

| ファイル | 変更内容 |
|---------|---------|
| [Farm.java](file:///c:/Users/user/Dev/FarMeet/farmeet-backend/src/main/java/com/farmeet/entity/Farm.java) | `publicId` (UUID) フィールド追加、`@PrePersist`で自動生成 |
| [FarmRepository.java](file:///c:/Users/user/Dev/FarMeet/farmeet-backend/src/main/java/com/farmeet/repository/FarmRepository.java) | `findByPublicId()` メソッド追加 |
| [FarmService.java](file:///c:/Users/user/Dev/FarMeet/farmeet-backend/src/main/java/com/farmeet/service/FarmService.java) | `getFarmDtoByPublicId()` メソッド追加 |
| [FarmController.java](file:///c:/Users/user/Dev/FarMeet/farmeet-backend/src/main/java/com/farmeet/controller/FarmController.java) | `/api/farms/p/{publicId}` エンドポイント追加 |
| [FarmDto.java](file:///c:/Users/user/Dev/FarMeet/farmeet-backend/src/main/java/com/farmeet/dto/FarmDto.java) | `publicId` フィールド追加 |

### フロントエンド

| ファイル | 変更内容 |
|---------|---------|
| [api.ts](file:///c:/Users/user/Dev/FarMeet/farmeet-frontend/lib/api.ts) | `getFarmByPublicId()` メソッド追加 |
| [types/index.ts](file:///c:/Users/user/Dev/FarMeet/farmeet-frontend/types/index.ts) | `Farm` 型に `publicId` 追加 |
| [farms/[id]/page.tsx](file:///c:/Users/user/Dev/FarMeet/farmeet-frontend/app/farms/%5Bid%5D/page.tsx) | UUID/数値ID両対応 |
| [FarmCard.tsx](file:///c:/Users/user/Dev/FarMeet/farmeet-frontend/components/FarmCard.tsx) | リンクを`publicId`ベースに変更 |
| [recentlyViewed.ts](file:///c:/Users/user/Dev/FarMeet/farmeet-frontend/lib/recentlyViewed.ts) | `publicId` フィールド追加 |

## URLの変化

```
変更前: /farms/1
変更後: /farms/550e8400-e29b-41d4-a716-446655440000
```

## 検証方法

1. **バックエンドを再起動**（既存データにUUIDが生成されます）
2. 農園一覧を表示し、農園カードをクリック
3. URLがUUID形式になっていることを確認
4. **既存の数値ID**でもアクセス可能（後方互換性維持）

> [!NOTE]
> 既存農園のデータはバックエンド再起動で自動的にUUIDが生成されます。
