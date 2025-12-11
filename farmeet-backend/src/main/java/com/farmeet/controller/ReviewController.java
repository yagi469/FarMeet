package com.farmeet.controller;

import com.farmeet.dto.ReviewDto;
import com.farmeet.entity.Review;
import com.farmeet.entity.User;
import com.farmeet.service.ReviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    /**
     * 農園のレビュー一覧取得
     */
    @GetMapping("/farms/{farmId}/reviews")
    public ResponseEntity<Map<String, Object>> getReviews(@PathVariable Long farmId) {
        List<Review> reviews = reviewService.getReviewsByFarm(farmId);
        List<ReviewDto> reviewDtos = reviews.stream()
                .map(ReviewDto::fromEntity)
                .collect(Collectors.toList());

        Double avgRating = reviewService.getAverageRating(farmId);
        Long reviewCount = reviewService.getReviewCount(farmId);

        return ResponseEntity.ok(Map.of(
                "reviews", reviewDtos,
                "averageRating", avgRating != null ? avgRating : 0.0,
                "reviewCount", reviewCount));
    }

    /**
     * レビュー投稿
     */
    @PostMapping("/farms/{farmId}/reviews")
    public ResponseEntity<ReviewDto> createReview(
            @AuthenticationPrincipal User user,
            @PathVariable Long farmId,
            @RequestBody Map<String, Object> payload) {

        Integer rating = (Integer) payload.get("rating");
        String comment = (String) payload.get("comment");

        if (rating == null || rating < 1 || rating > 5) {
            throw new RuntimeException("Rating must be between 1 and 5");
        }

        Review review = reviewService.createReview(user, farmId, rating, comment);
        return ResponseEntity.ok(ReviewDto.fromEntity(review));
    }

    /**
     * レビュー削除
     */
    @DeleteMapping("/reviews/{id}")
    public ResponseEntity<Map<String, Object>> deleteReview(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {

        reviewService.deleteReview(user, id);
        return ResponseEntity.ok(Map.of("success", true));
    }

    /**
     * 複数農園の評価情報を一括取得
     */
    @GetMapping("/farms/ratings")
    public ResponseEntity<Map<String, Object>> getRatings(@RequestParam List<Long> farmIds) {
        Map<Long, double[]> ratings = reviewService.getRatingsForFarms(farmIds);
        return ResponseEntity.ok(Map.of("ratings", ratings));
    }
}
