package com.farmeet.repository;

import com.farmeet.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findByUserId(Long userId);

    List<Reservation> findByEventId(Long eventId);

    @Query("SELECT r FROM Reservation r WHERE r.event.farm.owner.id = :ownerId ORDER BY r.createdAt DESC")
    List<Reservation> findByFarmOwnerId(@Param("ownerId") Long ownerId);
}
