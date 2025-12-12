package com.farmeet.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 決済情報を管理するエンティティ
 */
@Entity
@Table(name = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "reservation_id", nullable = false)
    private Reservation reservation;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false)
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "refunded_amount", precision = 10, scale = 2)
    private BigDecimal refundedAmount = BigDecimal.ZERO;

    /** Stripe Payment Intent ID */
    @Column(name = "stripe_payment_intent_id")
    private String stripePaymentIntentId;

    /** Stripe Checkout Session ID */
    @Column(name = "stripe_checkout_session_id")
    private String stripeCheckoutSessionId;

    /** PayPay Payment ID */
    @Column(name = "paypay_payment_id")
    private String paypayPaymentId;

    /** 銀行振込の場合の振込期限 */
    @Column(name = "transfer_deadline")
    private LocalDateTime transferDeadline;

    /** 決済完了日時 */
    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    /** 返金日時 */
    @Column(name = "refunded_at")
    private LocalDateTime refundedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
