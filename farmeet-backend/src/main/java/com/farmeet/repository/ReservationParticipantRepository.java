package com.farmeet.repository;

import com.farmeet.entity.ReservationParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReservationParticipantRepository extends JpaRepository<ReservationParticipant, Long> {

    List<ReservationParticipant> findByReservationId(Long reservationId);

    Optional<ReservationParticipant> findByReservationIdAndUserId(Long reservationId, Long userId);

    boolean existsByReservationIdAndUserId(Long reservationId, Long userId);

    void deleteByReservationIdAndUserId(Long reservationId, Long userId);

    List<ReservationParticipant> findByUserId(Long userId);
}
