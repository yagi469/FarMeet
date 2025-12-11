package com.farmeet.repository;

import com.farmeet.entity.Reservation;
import com.farmeet.entity.Reservation.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findByUserId(Long userId);

    List<Reservation> findByEventId(Long eventId);

    @Query("SELECT r FROM Reservation r WHERE r.event.farm.owner.id = :ownerId ORDER BY r.createdAt DESC")
    List<Reservation> findByFarmOwnerId(@Param("ownerId") Long ownerId);

    // イベント終了後のCONFIRMED予約を検索（スケジューラー用）
    @Query("SELECT r FROM Reservation r WHERE r.status = :status AND r.event.eventDate < :now")
    List<Reservation> findByStatusAndEventDateBefore(
            @Param("status") ReservationStatus status,
            @Param("now") LocalDateTime now);

    // ユーザーが特定の農園で体験済みの予約があるかチェック
    @Query("SELECT COUNT(r) > 0 FROM Reservation r WHERE r.user.id = :userId AND r.event.farm.id = :farmId AND r.status = :status")
    boolean existsByUserIdAndFarmIdAndStatus(
            @Param("userId") Long userId,
            @Param("farmId") Long farmId,
            @Param("status") ReservationStatus status);
}
