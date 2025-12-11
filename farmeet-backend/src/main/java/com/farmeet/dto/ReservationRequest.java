package com.farmeet.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReservationRequest {
    private Long eventId;
    private Integer numberOfPeople;
    private Integer numberOfAdults; // 大人人数（13歳以上）
    private Integer numberOfChildren; // 子供人数（6-12歳）
    private Integer numberOfInfants; // 幼児人数（0-5歳、無料）
}
