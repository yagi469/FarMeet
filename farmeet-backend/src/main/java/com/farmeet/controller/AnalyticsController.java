package com.farmeet.controller;

import com.farmeet.entity.ActivityLog;
import com.farmeet.service.ActivityLogService;
import com.farmeet.service.AnalyticsService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/analytics")
public class AnalyticsController {

    private final ActivityLogService activityLogService;
    private final AnalyticsService analyticsService;

    public AnalyticsController(ActivityLogService activityLogService, AnalyticsService analyticsService) {
        this.activityLogService = activityLogService;
        this.analyticsService = analyticsService;
    }

    /**
     * Get recent activities
     */
    @GetMapping("/activities")
    public List<ActivityLog> getRecentActivities(@RequestParam(defaultValue = "20") int limit) {
        return activityLogService.getRecentActivities(limit);
    }

    /**
     * Get overview stats
     */
    @GetMapping("/stats")
    public Map<String, Object> getOverviewStats() {
        return analyticsService.getOverviewStats();
    }

    /**
     * Get daily stats for charts
     */
    @GetMapping("/daily")
    public List<Map<String, Object>> getDailyStats(@RequestParam(defaultValue = "30") int days) {
        return analyticsService.getDailyStats(days);
    }

    /**
     * Get popular farms
     */
    @GetMapping("/popular-farms")
    public List<Map<String, Object>> getPopularFarms(@RequestParam(defaultValue = "5") int limit) {
        return analyticsService.getPopularFarms(limit);
    }

    /**
     * Get popular events
     */
    @GetMapping("/popular-events")
    public List<Map<String, Object>> getPopularEvents(@RequestParam(defaultValue = "5") int limit) {
        return analyticsService.getPopularEvents(limit);
    }
}
