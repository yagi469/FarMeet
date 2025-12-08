package com.farmeet.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "activity_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ActivityType activityType;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "target_id")
    private Long targetId;

    @Column(name = "target_type")
    private String targetType;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum ActivityType {
        // User activities
        USER_SIGNUP,
        USER_LOGIN,
        USER_DELETED,
        USER_RESTORED,

        // Reservation activities
        RESERVATION_CREATED,
        RESERVATION_CANCELLED,

        // Farm activities
        FARM_CREATED,
        FARM_UPDATED,
        FARM_DELETED,
        FARM_RESTORED,

        // Event activities
        EVENT_CREATED,
        EVENT_UPDATED,
        EVENT_DELETED,
        EVENT_RESTORED,

        // Admin activities
        ADMIN_USER_BANNED,
        ADMIN_USER_RESTORED,
        ADMIN_HARD_DELETE
    }
}
