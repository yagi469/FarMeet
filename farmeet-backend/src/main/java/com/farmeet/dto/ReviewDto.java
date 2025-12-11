package com.farmeet.dto;

import com.farmeet.entity.Review;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ReviewDto {
    private Long id;
    private Long farmId;
    private UserDto user;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;

    public static ReviewDto fromEntity(Review review) {
        ReviewDto dto = new ReviewDto();
        dto.setId(review.getId());
        dto.setFarmId(review.getFarm().getId());
        dto.setUser(UserDto.fromEntity(review.getUser()));
        dto.setRating(review.getRating());
        dto.setComment(review.getComment());
        dto.setCreatedAt(review.getCreatedAt());
        return dto;
    }
}
