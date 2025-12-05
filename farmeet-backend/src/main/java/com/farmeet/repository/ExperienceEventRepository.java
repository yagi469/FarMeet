package com.farmeet.repository;

import com.farmeet.entity.ExperienceEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ExperienceEventRepository extends JpaRepository<ExperienceEvent, Long> {
    List<ExperienceEvent> findByFarmId(Long farmId);

    // 日程範囲でイベントを検索
    List<ExperienceEvent> findByEventDateBetween(LocalDateTime startDate, LocalDateTime endDate);

    // 日程範囲と空き枠数でイベントを検索
    @Query("SELECT e FROM ExperienceEvent e WHERE e.eventDate BETWEEN :start AND :end AND e.availableSlots >= :minSlots")
    List<ExperienceEvent> findByEventDateBetweenAndMinSlots(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            @Param("minSlots") int minSlots);

    // 空き枠数以上のイベントを持つ農園IDを取得
    @Query("SELECT DISTINCT e.farm.id FROM ExperienceEvent e WHERE e.availableSlots >= :minSlots AND e.eventDate > :now")
    List<Long> findFarmIdsByMinSlots(@Param("minSlots") int minSlots, @Param("now") LocalDateTime now);
}
