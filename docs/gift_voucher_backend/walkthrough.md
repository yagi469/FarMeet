# ギフト券機能 - ウォークスルー

## 実装完了

ギフト券のバックエンド機能とフロントエンドUIの両方が完成しました。

---

## バックエンド（9ファイル）

### 新規作成（6ファイル）
| ファイル | 説明 |
|---------|------|
| [GiftVoucherStatus.java](file:///c:/Users/user/Dev/FarMeet/farmeet-backend/src/main/java/com/farmeet/entity/GiftVoucherStatus.java) | ステータス列挙型 |
| [GiftVoucher.java](file:///c:/Users/user/Dev/FarMeet/farmeet-backend/src/main/java/com/farmeet/entity/GiftVoucher.java) | エンティティ |
| [GiftVoucherDto.java](file:///c:/Users/user/Dev/FarMeet/farmeet-backend/src/main/java/com/farmeet/dto/GiftVoucherDto.java) | DTO |
| [GiftVoucherRepository.java](file:///c:/Users/user/Dev/FarMeet/farmeet-backend/src/main/java/com/farmeet/repository/GiftVoucherRepository.java) | リポジトリ |
| [GiftVoucherService.java](file:///c:/Users/user/Dev/FarMeet/farmeet-backend/src/main/java/com/farmeet/service/GiftVoucherService.java) | ビジネスロジック |
| [GiftVoucherController.java](file:///c:/Users/user/Dev/FarMeet/farmeet-backend/src/main/java/com/farmeet/controller/GiftVoucherController.java) | RESTコントローラー |

### 更新（3ファイル）
| ファイル | 変更内容 |
|---------|---------|
| [Payment.java](file:///c:/Users/user/Dev/FarMeet/farmeet-backend/src/main/java/com/farmeet/entity/Payment.java) | voucherAmount/usedVoucher追加 |
| [PaymentService.java](file:///c:/Users/user/Dev/FarMeet/farmeet-backend/src/main/java/com/farmeet/service/PaymentService.java) | ギフト券適用・残高消費 |
| [PaymentController.java](file:///c:/Users/user/Dev/FarMeet/farmeet-backend/src/main/java/com/farmeet/controller/PaymentController.java) | voucherIdパラメータ対応 |

---

## フロントエンド（2ファイル更新）

| ファイル | 変更内容 |
|---------|---------|
| [api.ts](file:///c:/Users/user/Dev/FarMeet/farmeet-frontend/lib/api.ts) | voucherIdパラメータ追加 |
| [payment/page.tsx](file:///c:/Users/user/Dev/FarMeet/farmeet-frontend/app/payment/page.tsx) | ギフト券選択UI |

---

## ギフト券選択UI

決済ページに以下の機能を追加：
- 使用可能なギフト券の一覧表示
- ラジオボタンで選択
- 選択時の割引額をリアルタイム計算
- 全額支払い時は「ギフト券で支払う」ボタンを表示

---

## 検証結果

✅ **Mavenコンパイル成功**  
✅ **Next.jsビルド成功**
