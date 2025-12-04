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

    @Transactional
    public Reservation createReservation(User user, Long eventId, Integer numberOfPeople) {
        ExperienceEvent event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if (event.getAvailableSlots() < numberOfPeople) {
            throw new RuntimeException("Not enough available slots");
        }

        Reservation reservation = new Reservation();
        reservation.setUser(user);
        reservation.setEvent(event);
        reservation.setNumberOfPeople(numberOfPeople);
        reservation.setStatus(Reservation.ReservationStatus.CONFIRMED);
        reservation.setTotalPrice(event.getPrice().multiply(BigDecimal.valueOf(numberOfPeople)));

        // Update available slots
        event.setAvailableSlots(event.getAvailableSlots() - numberOfPeople);
        eventRepository.save(event);

        return reservationRepository.save(reservation);
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
