package com.farmeet.repository;

import com.farmeet.entity.Farm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface FarmRepository extends JpaRepository<Farm, Long> {
    List<Farm> findByOwnerId(Long ownerId);

    Farm findByName(String name);

    // キーワード検索（農園名、地域、説明文で部分一致）
    List<Farm> findByNameContainingOrLocationContainingOrDescriptionContaining(
            String name, String location, String description);

    // 地域で絞り込み
    List<Farm> findByLocationContaining(String location);

    // 日程でイベントがある農園を検索
    @Query("SELECT DISTINCT f FROM Farm f JOIN f.experienceEvents e WHERE e.eventDate >= :startDate AND e.eventDate <= :endDate")
    List<Farm> findByEventDateRange(@Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);
}
