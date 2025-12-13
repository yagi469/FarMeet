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
        List<ReservationDto> reservations = reservationService.getUserReservationsAsDto(user.getId());
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

    // ========== 招待リンク機能 ==========

    /**
     * 招待リンクを生成
     */
    @PostMapping("/{id}/invite")
    public ResponseEntity<?> generateInviteCode(@PathVariable Long id,
            @AuthenticationPrincipal User user) {
        try {
            String inviteCode = reservationService.generateInviteCode(id, user);
            return ResponseEntity.ok(java.util.Map.of("inviteCode", inviteCode));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    /**
     * 招待コードから予約詳細を取得（未認証でも可）
     */
    @GetMapping("/join/{code}")
    public ResponseEntity<?> getInviteDetails(@PathVariable String code) {
        try {
            var reservation = reservationService.getReservationByInviteCode(code);
            return ResponseEntity.ok(ReservationDto.fromEntity(reservation));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * 招待リンクから参加
     */
    @PostMapping("/join/{code}")
    public ResponseEntity<?> joinReservation(@PathVariable String code,
            @RequestBody(required = false) java.util.Map<String, String> body,
            @AuthenticationPrincipal User user) {
        try {
            // カテゴリを取得（デフォルトはADULT）
            com.farmeet.entity.ReservationParticipant.ParticipantCategory category = com.farmeet.entity.ReservationParticipant.ParticipantCategory.ADULT;
            if (body != null && body.containsKey("category")) {
                try {
                    category = com.farmeet.entity.ReservationParticipant.ParticipantCategory
                            .valueOf(body.get("category"));
                } catch (IllegalArgumentException e) {
                    return ResponseEntity.badRequest().body(java.util.Map.of("error", "Invalid category"));
                }
            }

            var participant = reservationService.joinReservation(code, user, category);
            return ResponseEntity.ok(java.util.Map.of(
                    "message", "参加しました",
                    "reservationId", participant.getReservation().getId()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    /**
     * 予約から離脱
     */
    @DeleteMapping("/{id}/participants/me")
    public ResponseEntity<?> leaveReservation(@PathVariable Long id,
            @AuthenticationPrincipal User user) {
        try {
            reservationService.leaveReservation(id, user);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    /**
     * 参加者一覧を取得
     */
    @GetMapping("/{id}/participants")
    public ResponseEntity<?> getParticipants(@PathVariable Long id,
            @AuthenticationPrincipal User user) {
        try {
            var participants = reservationService.getParticipants(id, user);
            var result = participants.stream()
                    .map(p -> java.util.Map.of(
                            "id", p.getId(),
                            "userId", p.getUser().getId(),
                            "username", p.getUser().getUsername(),
                            "category", p.getCategory().name(),
                            "joinedAt", p.getJoinedAt().toString()))
                    .collect(java.util.stream.Collectors.toList());
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    /**
     * 参加者を削除（予約者のみ）
     */
    @DeleteMapping("/{id}/participants/{participantId}")
    public ResponseEntity<?> removeParticipant(@PathVariable Long id,
            @PathVariable Long participantId,
            @AuthenticationPrincipal User user) {
        try {
            reservationService.removeParticipant(id, participantId, user);
            return ResponseEntity.ok(java.util.Map.of("message", "参加者を削除しました"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }
}
