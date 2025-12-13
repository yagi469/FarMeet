package com.farmeet.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "reservations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "event_id", nullable = false)
    private ExperienceEvent event;

    @Column(name = "number_of_people", nullable = false)
    private Integer numberOfPeople;

    @Column(name = "number_of_adults")
    private Integer numberOfAdults; // 13歳以上

    @Column(name = "number_of_children")
    private Integer numberOfChildren; // 6-12歳

    @Column(name = "number_of_infants")
    private Integer numberOfInfants; // 0-5歳（無料）

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReservationStatus status = ReservationStatus.PENDING_PAYMENT;

    @Column(name = "total_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalPrice;

    @OneToOne(mappedBy = "reservation", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Payment payment;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum ReservationStatus {
        /** 決済待ち（予約作成直後） */
        PENDING_PAYMENT,
        /** 銀行振込待ち */
        AWAITING_TRANSFER,
        /** 決済失敗 */
        PAYMENT_FAILED,
        /** 確定済み（決済完了） */
        CONFIRMED,
        /** キャンセル済み */
        CANCELLED,
        /** 完了（イベント終了後） */
        COMPLETED,
        /** 旧ステータス（後方互換性のため保持） */
        PENDING
    }
}
