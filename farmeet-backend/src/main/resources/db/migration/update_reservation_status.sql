-- 決済機能用のステータス追加
-- PostgreSQL（Neon）で実行してください

-- 1. 既存のcheck constraintを削除
ALTER TABLE reservations DROP CONSTRAINT IF EXISTS reservations_status_check;

-- 2. 新しいcheck constraintを追加（新ステータスを含む）
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

-- 3. paymentsテーブルが存在しない場合は作成
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

-- 確認
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name = 'reservations_status_check';
