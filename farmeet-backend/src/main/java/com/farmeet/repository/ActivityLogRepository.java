package com.farmeet.repository;

import com.farmeet.entity.ActivityLog;
import com.farmeet.entity.ActivityLog.ActivityType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {

    List<ActivityLog> findAllByOrderByCreatedAtDesc(Pageable pageable);

    List<ActivityLog> findByActivityTypeOrderByCreatedAtDesc(ActivityType activityType, Pageable pageable);

    List<ActivityLog> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    @Query("SELECT COUNT(a) FROM ActivityLog a WHERE a.activityType = :type AND a.createdAt >= :since")
    long countByActivityTypeSince(@Param("type") ActivityType type, @Param("since") LocalDateTime since);

    @Query("SELECT DATE(a.createdAt), COUNT(a) FROM ActivityLog a WHERE a.activityType = :type AND a.createdAt >= :since GROUP BY DATE(a.createdAt) ORDER BY DATE(a.createdAt)")
    List<Object[]> countDailyByActivityType(@Param("type") ActivityType type, @Param("since") LocalDateTime since);
}
