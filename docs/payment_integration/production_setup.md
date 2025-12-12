# 決済機能 本番環境設定ガイド

## 必須環境変数

### Stripe（本番用）

Stripeダッシュボード（https://dashboard.stripe.com/）で**本番モード**に切り替えて取得：

| 環境変数 | 説明 | 取得場所 |
|---------|------|---------|
| `STRIPE_SECRET_KEY` | 本番シークレットキー（`sk_live_...`） | 開発者 → APIキー |
| `STRIPE_WEBHOOK_SECRET` | Webhook署名シークレット | 開発者 → Webhook |

### PayPay（オプション・審査完了後）

| 環境変数 | 説明 |
|---------|------|
| `PAYPAY_API_KEY` | API Key |
| `PAYPAY_API_SECRET` | API Secret |
| `PAYPAY_MERCHANT_ID` | Merchant ID |

---

## データベース設定

PostgreSQL（Neon）の**本番ブランチ**で以下のSQLを実行：

```sql
-- 既存の制約を削除
ALTER TABLE reservations DROP CONSTRAINT IF EXISTS reservations_status_check;

-- 新しい制約を追加（決済ステータス対応）
ALTER TABLE reservations ADD CONSTRAINT reservations_status_check 
CHECK (status IN (
    'PENDING', 
    'PENDING_PAYMENT', 
    'AWAITING_TRANSFER', 
    'PAYMENT_FAILED', 
    'CONFIRMED', 
    'CANCELLED', 
    'COMPLETED'
));

-- paymentsテーブル作成（存在しない場合）
CREATE TABLE IF NOT EXISTS payments (
    id BIGSERIAL PRIMARY KEY,
    reservation_id BIGINT NOT NULL REFERENCES reservations(id),
    payment_method VARCHAR(50) NOT NULL,
    payment_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    amount DECIMAL(10, 2) NOT NULL,
    refunded_amount DECIMAL(10, 2) DEFAULT 0,
    stripe_payment_intent_id VARCHAR(255),
    stripe_checkout_session_id VARCHAR(255),
    paypay_payment_id VARCHAR(255),
    transfer_deadline TIMESTAMP,
    paid_at TIMESTAMP,
    refunded_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);
```

---

## Render での環境変数設定

1. Renderダッシュボード → バックエンドサービス → **Environment**
2. 「Add Environment Variable」で上記を追加
3. サービスを再デプロイ

---

## Stripe Webhook 設定

1. Stripeダッシュボード → **開発者** → **Webhook**
2. 「エンドポイントを追加」
3. 設定：
   - **URL**: `https://あなたのバックエンドURL/api/payments/webhook/stripe`
   - **イベント**: `checkout.session.completed` を選択
4. 作成後、「署名シークレット」をコピー → `STRIPE_WEBHOOK_SECRET` に設定

---

## キャンセルポリシー

| キャンセル時期 | 返金率 |
|-------------|-------|
| 4日前まで | 100% |
| 1〜3日前 | 50% |
| 当日 | 0% |

---

## テスト用カード情報

| カード番号 | 結果 |
|-----------|------|
| `4242 4242 4242 4242` | 成功 |
| `4000 0000 0000 0002` | 拒否 |
| `4000 0000 0000 3220` | 3Dセキュア |

有効期限: 未来の日付（例: 12/34）  
CVC: 任意の3桁（例: 123）
