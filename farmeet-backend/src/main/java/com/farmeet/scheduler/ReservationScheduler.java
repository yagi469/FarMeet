package com.farmeet.scheduler;

import com.farmeet.entity.Reservation;
import com.farmeet.entity.Reservation.ReservationStatus;
import com.farmeet.repository.ReservationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class ReservationScheduler {

    private static final Logger logger = LoggerFactory.getLogger(ReservationScheduler.class);

    private final ReservationRepository reservationRepository;

    public ReservationScheduler(ReservationRepository reservationRepository) {
        this.reservationRepository = reservationRepository;
    }

    /**
     * 1時間ごとに実行
     * イベント終了後のCONFIRMED予約をCOMPLETEDに変更
     */
    @Scheduled(fixedRate = 3600000) // 1時間ごと
    @Transactional
    public void updateCompletedReservations() {
        LocalDateTime now = LocalDateTime.now();

        List<Reservation> confirmedReservations = reservationRepository
                .findByStatusAndEventDateBefore(ReservationStatus.CONFIRMED, now);

        int count = 0;
        for (Reservation reservation : confirmedReservations) {
            reservation.setStatus(ReservationStatus.COMPLETED);
            reservationRepository.save(reservation);
            count++;
        }

        if (count > 0) {
            logger.info("Updated {} reservations to COMPLETED status", count);
        }
    }
}
