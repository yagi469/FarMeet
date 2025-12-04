package com.farmeet.repository;

import com.farmeet.entity.ExperienceEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExperienceEventRepository extends JpaRepository<ExperienceEvent, Long> {
    List<ExperienceEvent> findByFarmId(Long farmId);
}
