package com.farmeet.service;

import com.farmeet.entity.ActivityLog.ActivityType;
import com.farmeet.repository.ActivityLogRepository;
import com.farmeet.repository.ExperienceEventRepository;
import com.farmeet.repository.FarmRepository;
import com.farmeet.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.time.LocalDateTime;
import java.util.*;

@Service
@Transactional(readOnly = true)
public class AnalyticsService {

    private final ActivityLogRepository activityLogRepository;
    private final UserRepository userRepository;
    private final FarmRepository farmRepository;
    private final ExperienceEventRepository eventRepository;

    @PersistenceContext
    private EntityManager entityManager;

    public AnalyticsService(ActivityLogRepository activityLogRepository,
            UserRepository userRepository,
            FarmRepository farmRepository,
            ExperienceEventRepository eventRepository) {
        this.activityLogRepository = activityLogRepository;
        this.userRepository = userRepository;
        this.farmRepository = farmRepository;
        this.eventRepository = eventRepository;
    }

    /**
     * Get overview stats
     */
    public Map<String, Object> getOverviewStats() {
        Map<String, Object> stats = new HashMap<>();

        stats.put("totalUsers", userRepository.count());
        stats.put("totalFarms", farmRepository.count());
        stats.put("totalEvents", eventRepository.count());

        // Count reservations
        Long totalReservations = (Long) entityManager
                .createQuery("SELECT COUNT(r) FROM Reservation r WHERE r.status != 'CANCELLED'")
                .getSingleResult();
        stats.put("totalReservations", totalReservations);

        // Recent signups (last 7 days)
        LocalDateTime weekAgo = LocalDateTime.now().minusDays(7);
        stats.put("recentSignups", activityLogRepository.countByActivityTypeSince(ActivityType.USER_SIGNUP, weekAgo));
        stats.put("recentReservations",
                activityLogRepository.countByActivityTypeSince(ActivityType.RESERVATION_CREATED, weekAgo));

        return stats;
    }

    /**
     * Get daily stats for the last N days
     */
    public List<Map<String, Object>> getDailyStats(int days) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);

        // Get daily signup counts
        List<Object[]> signupData = activityLogRepository.countDailyByActivityType(ActivityType.USER_SIGNUP, since);

        // Get daily reservation counts
        List<Object[]> reservationData = activityLogRepository
                .countDailyByActivityType(ActivityType.RESERVATION_CREATED, since);

        // Merge data by date
        Map<String, Map<String, Object>> dailyMap = new LinkedHashMap<>();

        for (Object[] row : signupData) {
            String date = row[0].toString();
            Map<String, Object> dayStats = dailyMap.computeIfAbsent(date, k -> {
                Map<String, Object> m = new HashMap<>();
                m.put("date", date);
                m.put("signups", 0L);
                m.put("reservations", 0L);
                return m;
            });
            dayStats.put("signups", ((Number) row[1]).longValue());
        }

        for (Object[] row : reservationData) {
            String date = row[0].toString();
            Map<String, Object> dayStats = dailyMap.computeIfAbsent(date, k -> {
                Map<String, Object> m = new HashMap<>();
                m.put("date", date);
                m.put("signups", 0L);
                m.put("reservations", 0L);
                return m;
            });
            dayStats.put("reservations", ((Number) row[1]).longValue());
        }

        return new ArrayList<>(dailyMap.values());
    }

    /**
     * Get popular farms by reservation count
     */
    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> getPopularFarms(int limit) {
        String sql = """
                SELECT f.id, f.name, f.location, COUNT(r.id) as reservation_count
                FROM farms f
                LEFT JOIN experience_events e ON e.farm_id = f.id
                LEFT JOIN reservations r ON r.event_id = e.id AND r.status != 'CANCELLED'
                WHERE f.deleted = false
                GROUP BY f.id, f.name, f.location
                ORDER BY reservation_count DESC
                LIMIT :limit
                """;

        List<Object[]> results = entityManager.createNativeQuery(sql)
                .setParameter("limit", limit)
                .getResultList();

        List<Map<String, Object>> farms = new ArrayList<>();
        for (Object[] row : results) {
            Map<String, Object> farm = new HashMap<>();
            farm.put("id", ((Number) row[0]).longValue());
            farm.put("name", row[1]);
            farm.put("location", row[2]);
            farm.put("reservationCount", ((Number) row[3]).longValue());
            farms.add(farm);
        }

        return farms;
    }

    /**
     * Get popular events by reservation count
     */
    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> getPopularEvents(int limit) {
        String sql = """
                SELECT e.id, e.title, f.name as farm_name, COUNT(r.id) as reservation_count
                FROM experience_events e
                JOIN farms f ON f.id = e.farm_id
                LEFT JOIN reservations r ON r.event_id = e.id AND r.status != 'CANCELLED'
                WHERE e.deleted = false
                GROUP BY e.id, e.title, f.name
                ORDER BY reservation_count DESC
                LIMIT :limit
                """;

        List<Object[]> results = entityManager.createNativeQuery(sql)
                .setParameter("limit", limit)
                .getResultList();

        List<Map<String, Object>> events = new ArrayList<>();
        for (Object[] row : results) {
            Map<String, Object> event = new HashMap<>();
            event.put("id", ((Number) row[0]).longValue());
            event.put("title", row[1]);
            event.put("farmName", row[2]);
            event.put("reservationCount", ((Number) row[3]).longValue());
            events.add(event);
        }

        return events;
    }
}
