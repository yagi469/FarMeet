package com.farmeet.dto;

import com.farmeet.entity.Reservation;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ReservationDto {
    private Long id;
    private UserDto user;
    private ExperienceEventDto event;
    private Integer numberOfPeople;
    private Integer numberOfAdults;
    private Integer numberOfChildren;
    private Integer numberOfInfants;
    private String status;
    private BigDecimal totalPrice;
    private LocalDateTime createdAt;

    @Data
    public static class UserDto {
        private Long id;
        private String username;
        private String email;
        private String role;
        private String avatarUrl;
    }

    public static ReservationDto fromEntity(Reservation reservation) {
        ReservationDto dto = new ReservationDto();
        dto.setId(reservation.getId());
        if (reservation.getUser() != null) {
            UserDto userDto = new UserDto();
            userDto.setId(reservation.getUser().getId());
            userDto.setUsername(reservation.getUser().getUsername());
            userDto.setEmail(reservation.getUser().getEmail());
            userDto.setRole(reservation.getUser().getRole().name());
            userDto.setAvatarUrl(reservation.getUser().getAvatarUrl());
            dto.setUser(userDto);
        }
        if (reservation.getEvent() != null) {
            dto.setEvent(ExperienceEventDto.fromEntity(reservation.getEvent()));
        }
        dto.setNumberOfPeople(reservation.getNumberOfPeople());
        dto.setNumberOfAdults(reservation.getNumberOfAdults());
        dto.setNumberOfChildren(reservation.getNumberOfChildren());
        dto.setNumberOfInfants(reservation.getNumberOfInfants());
        dto.setStatus(reservation.getStatus().name());
        dto.setTotalPrice(reservation.getTotalPrice());
        dto.setCreatedAt(reservation.getCreatedAt());
        return dto;
    }
}
