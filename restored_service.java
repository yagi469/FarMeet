package com.farmeet.service;

import com.farmeet.dto.ReservationDto;
import com.farmeet.entity.ExperienceEvent;
import com.farmeet.entity.Payment;
import com.farmeet.entity.PaymentStatus;
import com.farmeet.entity.Reservation;
import com.farmeet.entity.ReservationParticipant;
import com.farmeet.entity.User;
import com.farmeet.repository.ExperienceEventRepository;
import com.farmeet.repository.PaymentRepository;
import com.farmeet.repository.ReservationRepository;
import com.stripe.exception.StripeException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class ReservationService {

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private ExperienceEventRepository eventRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private PaymentService paymentService;

    @Transactional(readOnly = true)
    public List<ReservationDto> getUserReservationsAsDto(Long userId) {
        // 自分が予約者の予約
        List<Reservation> ownReservations = reservationRepository.findByUserIdOrderByCreatedAtDesc(userId);

        // 参加者として参加している予約のIDを取得
        List<ReservationParticipant> participations = participantRepository.findByUserId(userId);
        List<Long> participatingReservationIds = participations.stream()
                .map(p -> p.getReservation().getId())
                .toList();

        // マージして重複を除去
        java.util.Set<Long> seenIds = new java.util.HashSet<>();
        List<ReservationDto> allReservations = new java.util.ArrayList<>();

        for (Reservation r : ownReservations) {
            if (seenIds.add(r.getId())) {
                allReservations.add(ReservationDto.fromEntity(r));
            }
        }

        // 参加中の予約を個別に取得（完全なデータを取得）
        for (Long reservationId : participatingReservationIds) {
            if (seenIds.add(reservationId)) {
                reservationRepository.findById(reservationId)
                        .ifPresent(r -> allReservations.add(ReservationDto.fromEntity(r)));
            }
        }

        // 作成日時でソート
        allReservations.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));

        return allReservations;
    }

    public List<Reservation> getUserReservations(Long userId) {
        return reservationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Reservation> getFarmerReservations(Long farmerId) {
        return reservationRepository.findByFarmOwnerId(farmerId);
    }

    public Reservation getReservationById(Long id, User user) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        // ユーザー本人の予約、または農園オーナーの予約のみ閲覧可能
        if (!reservation.getUser().getId().equals(user.getId()) &&
                !reservation.getEvent().getFarm().getOwner().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        return reservation;
    }

    @Transactional
    public Reservation createReservation(User user, Long eventId, Integer numberOfAdults, Integer numberOfChildren,
            Integer numberOfInfants) {
        ExperienceEvent event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        int totalPeople = numberOfAdults + numberOfChildren + numberOfInfants;
        if (event.getAvailableSlots() < totalPeople) {
            throw new RuntimeException("Not enough available slots");
        }

        // 料金計算: 大人料金 × 大人人数 + 子供料金 × 子供人数（幼児は無料）
        BigDecimal adultPrice = event.getPrice();
        BigDecimal childPrice = event.getChildPrice() != null ? event.getChildPrice() : event.getPrice();
        BigDecimal totalPrice = adultPrice.multiply(BigDecimal.valueOf(numberOfAdults))
                .add(childPrice.multiply(BigDecimal.valueOf(numberOfChildren)));

        Reservation reservation = new Reservation();
        reservation.setUser(user);
        reservation.setEvent(event);
        reservation.setNumberOfPeople(totalPeople);
        reservation.setNumberOfAdults(numberOfAdults);
        reservation.setNumberOfChildren(numberOfChildren);
        reservation.setNumberOfInfants(numberOfInfants);
        reservation.setStatus(Reservation.ReservationStatus.PENDING_PAYMENT);
        reservation.setTotalPrice(totalPrice);

        // Update available slots
        event.setAvailableSlots(event.getAvailableSlots() - totalPeople);
        eventRepository.save(event);

        return reservationRepository.save(reservation);
    }

    // 後方互換性のためのオーバーロード（既存API用）
    @Transactional
    public Reservation createReservation(User user, Long eventId, Integer numberOfPeople) {
        return createReservation(user, eventId, numberOfPeople, 0, 0);
    }

    @Transactional
    public void cancelReservation(Long reservationId, User user) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        if (!reservation.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        if (reservation.getStatus() == Reservation.ReservationStatus.CANCELLED) {
            throw new RuntimeException("Reservation already cancelled");
        }

        // 決済が完了している場合は返金処理を実行
        Optional<Payment> paymentOpt = paymentRepository.findByReservationId(reservationId);
        if (paymentOpt.isPresent()) {
            Payment payment = paymentOpt.get();
            if (payment.getPaymentStatus() == PaymentStatus.COMPLETED) {
                try {
                    paymentService.processRefund(reservationId);
                } catch (StripeException e) {
                    throw new RuntimeException("返金処理に失敗しました: " + e.getMessage());
                }
            }
        }

        reservation.setStatus(Reservation.ReservationStatus.CANCELLED);

        // Restore available slots
        ExperienceEvent event = reservation.getEvent();
        event.setAvailableSlots(event.getAvailableSlots() + reservation.getNumberOfPeople());
        eventRepository.save(event);

        reservationRepository.save(reservation);
    }

    // ========== 招待リンク機能 ==========

    @Autowired
    private com.farmeet.repository.ReservationParticipantRepository participantRepository;

    /**
     * 招待コードを生成
     */
    @Transactional
    public String generateInviteCode(Long reservationId, User user) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        // 予約者本人のみ招待コード生成可能
        if (!reservation.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized: Only reservation owner can generate invite link");
        }

        // 既に招待コードがある場合はそれを返す
        if (reservation.getInviteCode() != null) {
            return reservation.getInviteCode();
        }

        // 8文字のランダムコードを生成
        String inviteCode = java.util.UUID.randomUUID().toString().replace("-", "").substring(0, 8);
        reservation.setInviteCode(inviteCode);
        reservationRepository.save(reservation);

        return inviteCode;
    }

    /**
     * 招待コードから予約情報を取得
     */
    public Reservation getReservationByInviteCode(String inviteCode) {
        return reservationRepository.findByInviteCode(inviteCode)
                .orElseThrow(() -> new RuntimeException("Invalid invite code"));
    }

    /**
     * 招待コードを使って予約に参加
     */
    @Transactional
    public com.farmeet.entity.ReservationParticipant joinReservation(String inviteCode, User user,
            ReservationParticipant.ParticipantCategory category) {
        Reservation reservation = getReservationByInviteCode(inviteCode);

        // 予約者本人は参加できない（すでに参加している）
        if (reservation.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You are the reservation owner");
        }

        // 既に参加している場合はエラー
        if (participantRepository.existsByReservationIdAndUserId(reservation.getId(), user.getId())) {
            throw new RuntimeException("Already joined this reservation");
        }

        // キャンセル済みの予約には参加できない
        if (reservation.getStatus() == Reservation.ReservationStatus.CANCELLED) {
            throw new RuntimeException("Cannot join cancelled reservation");
        }

        // カテゴリ別の残枠チェック
        List<ReservationParticipant> existingParticipants = participantRepository
                .findByReservationId(reservation.getId());

        int adultParticipants = (int) existingParticipants.stream()
                .filter(p -> p.getCategory() == ReservationParticipant.ParticipantCategory.ADULT).count();
        int childParticipants = (int) existingParticipants.stream()
                .filter(p -> p.getCategory() == ReservationParticipant.ParticipantCategory.CHILD).count();
        int infantParticipants = (int) existingParticipants.stream()
                .filter(p -> p.getCategory() == ReservationParticipant.ParticipantCategory.INFANT).count();

        // 予約者は大人として1枠使用
        int maxAdults = (reservation.getNumberOfAdults() != null ? reservation.getNumberOfAdults()
                : reservation.getNumberOfPeople()) - 1;
        int maxChildren = reservation.getNumberOfChildren() != null ? reservation.getNumberOfChildren() : 0;
        int maxInfants = reservation.getNumberOfInfants() != null ? reservation.getNumberOfInfants() : 0;

        switch (category) {
            case ADULT:
                if (adultParticipants >= maxAdults) {
                    throw new RuntimeException("大人の枠が満員です（残り0名）");
                }
                break;
            case CHILD:
                if (childParticipants >= maxChildren) {
                    throw new RuntimeException("子供の枠が満員です（残り0名）");
                }
                break;
            case INFANT:
                if (infantParticipants >= maxInfants) {
                    throw new RuntimeException("幼児の枠が満員です（残り0名）");
                }
                break;
        }

        com.farmeet.entity.ReservationParticipant participant = new com.farmeet.entity.ReservationParticipant();
        participant.setReservation(reservation);
        participant.setUser(user);
        participant.setCategory(category);

        return participantRepository.save(participant);
    }

    /**
     * 予約から離脱
     */
    @Transactional
    public void leaveReservation(Long reservationId, User user) {
        if (!participantRepository.existsByReservationIdAndUserId(reservationId, user.getId())) {
            throw new RuntimeException("You are not a participant of this reservation");
        }

        participantRepository.deleteByReservationIdAndUserId(reservationId, user.getId());
    }

    /**
     * 予約の参加者一覧を取得
     */
    public List<com.farmeet.entity.ReservationParticipant> getParticipants(Long reservationId, User user) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        // 予約者本人、参加者、または農園オーナーのみ閲覧可能
        boolean isOwner = reservation.getUser().getId().equals(user.getId());
        boolean isFarmOwner = reservation.getEvent().getFarm().getOwner().getId().equals(user.getId());
        boolean isParticipant = participantRepository.existsByReservationIdAndUserId(reservationId, user.getId());

        if (!isOwner && !isFarmOwner && !isParticipant) {
            throw new RuntimeException("Unauthorized");
        }

        return participantRepository.findByReservationId(reservationId);
    }

    /**
     * 予約者が参加者を削除
     */
    @Transactional
    public void removeParticipant(Long reservationId, Long participantId, User user) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        // 予約者本人のみ削除可能
        if (!reservation.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Only reservation owner can remove participants");
        }

        ReservationParticipant participant = participantRepository.findById(participantId)
                .orElseThrow(() -> new RuntimeException("Participant not found"));

        // 該当予約の参加者かどうか確認
        if (!participant.getReservation().getId().equals(reservationId)) {
            throw new RuntimeException("Participant does not belong to this reservation");
        }

        participantRepository.delete(participant);
    }
}
