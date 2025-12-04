package com.farmeet.controller;

import com.farmeet.dto.ReservationRequest;
import com.farmeet.entity.Reservation;
import com.farmeet.entity.User;
import com.farmeet.service.ReservationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    @Autowired
    private ReservationService reservationService;

    @GetMapping
    public ResponseEntity<List<Reservation>> getMyReservations(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(reservationService.getUserReservations(user.getId()));
    }

    @GetMapping("/farmer")
    public ResponseEntity<List<Reservation>> getFarmerReservations(@AuthenticationPrincipal User user) {
        if (user.getRole() != User.Role.FARMER) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(reservationService.getFarmerReservations(user.getId()));
    }

    @PostMapping
    public ResponseEntity<Reservation> createReservation(@RequestBody ReservationRequest request,
            @AuthenticationPrincipal User user) {
        try {
            Reservation reservation = reservationService.createReservation(
                    user, request.getEventId(), request.getNumberOfPeople());
            return ResponseEntity.ok(reservation);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelReservation(@PathVariable Long id,
            @AuthenticationPrincipal User user) {
        try {
            reservationService.cancelReservation(id, user);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
