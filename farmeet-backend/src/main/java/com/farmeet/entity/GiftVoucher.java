package com.farmeet.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * ギフト券エンティティ
 */
@Entity
@Table(name = "gift_vouchers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GiftVoucher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** ユニークなギフト券コード（16文字） */
    @Column(unique = true, length = 16)
    private String code;

    /** 額面金額 */
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    /** 残高 */
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal balance;

    /** ステータス */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GiftVoucherStatus status = GiftVoucherStatus.PENDING;

    /** 購入者（有料購入の場合） */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchaser_id")
    private User purchaser;

    /** 発行した管理者（無料発行の場合） */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "issued_by_id")
    private User issuedBy;

    /** 現在の所有者（登録後） */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    private User owner;

    /** 贈り先の名前 */
    @Column(name = "recipient_name")
    private String recipientName;

    /** 贈り先のメール */
    @Column(name = "recipient_email")
    private String recipientEmail;

    /** 添えるメッセージ */
    @Column(columnDefinition = "TEXT")
    private String message;

    /** 無料発行フラグ */
    @Column(name = "is_free_issue")
    private boolean freeIssue = false;

    /** 発行理由（無料発行の場合） */
    @Column(name = "issue_reason")
    private String issueReason;

    /** 購入時の決済方法 */
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method")
    private PaymentMethod paymentMethod;

    /** Stripe Payment Intent ID */
    @Column(name = "stripe_payment_intent_id")
    private String stripePaymentIntentId;

    /** Stripe Checkout Session ID */
    @Column(name = "stripe_checkout_session_id")
    private String stripeCheckoutSessionId;

    /** PayPay Payment ID */
    @Column(name = "paypay_payment_id")
    private String paypayPaymentId;

    /** 有効期限 */
    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    /** 作成日時 */
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /** 有効化日時 */
    @Column(name = "activated_at")
    private LocalDateTime activatedAt;

    /** 登録日時 */
    @Column(name = "redeemed_at")
    private LocalDateTime redeemedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (balance == null) {
            balance = amount;
        }
    }

    /**
     * ギフト券が使用可能かどうか
     */
    public boolean isUsable() {
        return (status == GiftVoucherStatus.ACTIVE || status == GiftVoucherStatus.REDEEMED)
                && balance.compareTo(BigDecimal.ZERO) > 0
                && (expiresAt == null || expiresAt.isAfter(LocalDateTime.now()));
    }
}
