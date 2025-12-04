package com.farmeet.repository;

import com.farmeet.entity.ExperienceEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ExperienceEventRepository extends JpaRepository<ExperienceEvent, Long> {
    List<ExperienceEvent> findByFarmId(Long farmId);

    // 日程範囲でイベントを検索
    List<ExperienceEvent> findByEventDateBetween(LocalDateTime startDate, LocalDateTime endDate);
}
