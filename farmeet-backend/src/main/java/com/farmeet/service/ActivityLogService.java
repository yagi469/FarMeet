package com.farmeet.service;

import com.farmeet.entity.ActivityLog;
import com.farmeet.entity.ActivityLog.ActivityType;
import com.farmeet.repository.ActivityLogRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;

    public ActivityLogService(ActivityLogRepository activityLogRepository) {
        this.activityLogRepository = activityLogRepository;
    }

    /**
     * Log an activity
     */
    public void log(ActivityType activityType, Long userId, Long targetId, String targetType, String description) {
        ActivityLog log = new ActivityLog();
        log.setActivityType(activityType);
        log.setUserId(userId);
        log.setTargetId(targetId);
        log.setTargetType(targetType);
        log.setDescription(description);
        activityLogRepository.save(log);
    }

    /**
     * Log user signup
     */
    public void logUserSignup(Long userId, String username) {
        log(ActivityType.USER_SIGNUP, userId, userId, "USER", "ユーザー「" + username + "」が登録しました");
    }

    /**
     * Log user login
     */
    public void logUserLogin(Long userId, String username) {
        log(ActivityType.USER_LOGIN, userId, userId, "USER", "ユーザー「" + username + "」がログインしました");
    }

    /**
     * Log reservation created
     */
    public void logReservationCreated(Long userId, Long reservationId, String eventTitle) {
        log(ActivityType.RESERVATION_CREATED, userId, reservationId, "RESERVATION", "「" + eventTitle + "」への予約が作成されました");
    }

    /**
     * Log reservation cancelled
     */
    public void logReservationCancelled(Long userId, Long reservationId, String eventTitle) {
        log(ActivityType.RESERVATION_CANCELLED, userId, reservationId, "RESERVATION",
                "「" + eventTitle + "」への予約がキャンセルされました");
    }

    /**
     * Log farm created
     */
    public void logFarmCreated(Long userId, Long farmId, String farmName) {
        log(ActivityType.FARM_CREATED, userId, farmId, "FARM", "農園「" + farmName + "」が作成されました");
    }

    /**
     * Log farm updated
     */
    public void logFarmUpdated(Long userId, Long farmId, String farmName) {
        log(ActivityType.FARM_UPDATED, userId, farmId, "FARM", "農園「" + farmName + "」が更新されました");
    }

    /**
     * Log farm deleted
     */
    public void logFarmDeleted(Long userId, Long farmId, String farmName) {
        log(ActivityType.FARM_DELETED, userId, farmId, "FARM", "農園「" + farmName + "」が削除されました");
    }

    /**
     * Log event created
     */
    public void logEventCreated(Long userId, Long eventId, String eventTitle) {
        log(ActivityType.EVENT_CREATED, userId, eventId, "EVENT", "イベント「" + eventTitle + "」が作成されました");
    }

    /**
     * Log event updated
     */
    public void logEventUpdated(Long userId, Long eventId, String eventTitle) {
        log(ActivityType.EVENT_UPDATED, userId, eventId, "EVENT", "イベント「" + eventTitle + "」が更新されました");
    }

    /**
     * Log event deleted
     */
    public void logEventDeleted(Long userId, Long eventId, String eventTitle) {
        log(ActivityType.EVENT_DELETED, userId, eventId, "EVENT", "イベント「" + eventTitle + "」が削除されました");
    }

    /**
     * Log admin user ban
     */
    public void logAdminUserBan(Long adminId, Long targetUserId, String targetUsername) {
        log(ActivityType.ADMIN_USER_BANNED, adminId, targetUserId, "USER", "管理者がユーザー「" + targetUsername + "」をBANしました");
    }

    /**
     * Log admin user restore
     */
    public void logAdminUserRestore(Long adminId, Long targetUserId, String targetUsername) {
        log(ActivityType.ADMIN_USER_RESTORED, adminId, targetUserId, "USER", "管理者がユーザー「" + targetUsername + "」を復元しました");
    }

    /**
     * Log admin hard delete
     */
    public void logAdminHardDelete(Long adminId, Long targetId, String targetType, String targetName) {
        log(ActivityType.ADMIN_HARD_DELETE, adminId, targetId, targetType,
                "管理者が" + targetType + "「" + targetName + "」を完全削除しました");
    }

    /**
     * Get recent activities
     */
    public List<ActivityLog> getRecentActivities(int limit) {
        return activityLogRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, limit));
    }

    /**
     * Get activities by type
     */
    public List<ActivityLog> getActivitiesByType(ActivityType type, int limit) {
        return activityLogRepository.findByActivityTypeOrderByCreatedAtDesc(type, PageRequest.of(0, limit));
    }

    /**
     * Get activities by user
     */
    public List<ActivityLog> getActivitiesByUser(Long userId, int limit) {
        return activityLogRepository.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(0, limit));
    }
}
