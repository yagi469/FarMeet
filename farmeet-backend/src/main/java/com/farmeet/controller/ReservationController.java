package com.farmeet.controller;

import com.farmeet.dto.ReservationDto;
import com.farmeet.dto.ReservationRequest;
import com.farmeet.entity.Reservation;
import com.farmeet.entity.User;
import com.farmeet.service.ReservationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    @Autowired
    private ReservationService reservationService;

    @GetMapping
    public ResponseEntity<List<ReservationDto>> getMyReservations(@AuthenticationPrincipal User user) {
        List<ReservationDto> reservations = reservationService.getUserReservations(user.getId())
                .stream()
                .map(ReservationDto::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(reservations);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReservationDto> getReservationById(@PathVariable Long id,
            @AuthenticationPrincipal User user) {
        try {
            Reservation reservation = reservationService.getReservationById(id, user);
            return ResponseEntity.ok(ReservationDto.fromEntity(reservation));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/farmer")
    public ResponseEntity<List<ReservationDto>> getFarmerReservations(@AuthenticationPrincipal User user) {
        if (user.getRole() != User.Role.FARMER) {
            return ResponseEntity.status(403).build();
        }
        List<ReservationDto> reservations = reservationService.getFarmerReservations(user.getId())
                .stream()
                .map(ReservationDto::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(reservations);
    }

    @PostMapping
    public ResponseEntity<ReservationDto> createReservation(@RequestBody ReservationRequest request,
            @AuthenticationPrincipal User user) {
        try {
            Reservation reservation;
            // 詳細情報が提供されている場合は詳細メソッドを使用
            if (request.getNumberOfAdults() != null) {
                reservation = reservationService.createReservation(
                        user,
                        request.getEventId(),
                        request.getNumberOfAdults(),
                        request.getNumberOfChildren() != null ? request.getNumberOfChildren() : 0,
                        request.getNumberOfInfants() != null ? request.getNumberOfInfants() : 0);
            } else {
                // 後方互換性: numberOfPeopleのみの場合
                reservation = reservationService.createReservation(
                        user, request.getEventId(), request.getNumberOfPeople());
            }
            return ResponseEntity.ok(ReservationDto.fromEntity(reservation));
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
