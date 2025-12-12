package com.farmeet.service;

import com.farmeet.entity.ExperienceEvent;
import com.farmeet.entity.Reservation;
import com.farmeet.entity.User;
import com.farmeet.repository.ExperienceEventRepository;
import com.farmeet.repository.ReservationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class ReservationService {

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private ExperienceEventRepository eventRepository;

    public List<Reservation> getUserReservations(Long userId) {
        return reservationRepository.findByUserId(userId);
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
        reservation.setStatus(Reservation.ReservationStatus.CONFIRMED);
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

        reservation.setStatus(Reservation.ReservationStatus.CANCELLED);

        // Restore available slots
        ExperienceEvent event = reservation.getEvent();
        event.setAvailableSlots(event.getAvailableSlots() + reservation.getNumberOfPeople());
        eventRepository.save(event);

        reservationRepository.save(reservation);
    }
}
