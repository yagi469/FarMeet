# 支払い待ち予約の自動キャンセルとタブUI実装

## バックエンド
- [x] `ReservationRepository` に期限切れ予約を検索するクエリを追加
- [x] `ReservationScheduler` に自動キャンセル処理を追加（48時間経過で自動キャンセル）
- [x] `ReservationService` にアクティブ予約と履歴予約を分けて取得するメソッドを追加
- [x] `ReservationController` に履歴データ用エンドポイントを追加

## フロントエンド
- [x] `api.ts` に新規APIエンドポイントを追加
- [x] `reservations/page.tsx` にタブUI（アクティブ/履歴）を実装
- [x] 支払い待ち予約に残り時間表示を追加

## 検証
- [x] ブラウザでタブ切り替えを確認
- [x] 自動キャンセルのログをサーバーで確認
