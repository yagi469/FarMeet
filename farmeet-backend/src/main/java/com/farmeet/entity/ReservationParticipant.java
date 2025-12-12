package com.farmeet.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 予約の参加者を管理するエンティティ
 * 予約者（owner）以外のグループメンバーを追跡
 */
@Entity
@Table(name = "reservation_participants", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "reservation_id", "user_id" })
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReservationParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id", nullable = false)
    private Reservation reservation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "joined_at", nullable = false, updatable = false)
    private LocalDateTime joinedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false)
    private ParticipantCategory category = ParticipantCategory.ADULT;

    public enum ParticipantCategory {
        ADULT, // 大人（13歳以上）
        CHILD, // 子供（6-12歳）
        INFANT // 幼児（0-5歳）
    }

    @PrePersist
    protected void onCreate() {
        joinedAt = LocalDateTime.now();
    }
}
