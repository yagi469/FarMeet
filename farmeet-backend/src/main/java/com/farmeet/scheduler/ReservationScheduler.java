package com.farmeet.scheduler;

import com.farmeet.entity.ExperienceEvent;
import com.farmeet.entity.Reservation;
import com.farmeet.entity.Reservation.ReservationStatus;
import com.farmeet.repository.ExperienceEventRepository;
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
    private final ExperienceEventRepository eventRepository;

    public ReservationScheduler(ReservationRepository reservationRepository,
            ExperienceEventRepository eventRepository) {
        this.reservationRepository = reservationRepository;
        this.eventRepository = eventRepository;
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

    /**
     * 1時間ごとに実行
     * 以下の条件で未決済予約を自動キャンセル:
     * 1. 予約作成から48時間経過
     * 2. イベント開始3時間前を過ぎている（どちらか早い方）
     */
    @Scheduled(fixedRate = 3600000) // 1時間ごと
    @Transactional
    public void cancelExpiredPendingPayments() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime createdDeadline = now.minusHours(48);
        LocalDateTime eventDeadline = now.plusHours(3); // イベント開始3時間前

        List<ReservationStatus> pendingStatuses = List.of(
                ReservationStatus.PENDING_PAYMENT,
                ReservationStatus.AWAITING_TRANSFER);

        // 48時間経過した予約
        List<Reservation> expiredByTime = reservationRepository
                .findExpiredPendingPaymentReservations(pendingStatuses, createdDeadline);

        // イベント開始3時間前を過ぎた予約
        List<Reservation> expiredByEvent = reservationRepository
                .findPendingByEventDateBefore(pendingStatuses, eventDeadline);

        // 重複を排除してマージ
        java.util.Set<Reservation> allExpired = new java.util.HashSet<>(expiredByTime);
        allExpired.addAll(expiredByEvent);

        int count = 0;
        for (Reservation reservation : allExpired) {
            // スロットを戻す
            ExperienceEvent event = reservation.getEvent();
            event.setAvailableSlots(event.getAvailableSlots() + reservation.getNumberOfPeople());
            eventRepository.save(event);

            // ステータスをキャンセルに変更
            reservation.setStatus(ReservationStatus.CANCELLED);
            reservationRepository.save(reservation);
            count++;
        }

        if (count > 0) {
            logger.info("Auto-cancelled {} expired pending payment reservations", count);
        }
    }
}
