package com.farmeet.service;

import com.farmeet.entity.Farm;
import com.farmeet.entity.Reservation.ReservationStatus;
import com.farmeet.entity.Review;
import com.farmeet.entity.User;
import com.farmeet.repository.FarmRepository;
import com.farmeet.repository.ReservationRepository;
import com.farmeet.repository.ReviewRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final FarmRepository farmRepository;
    private final ReservationRepository reservationRepository;

    public ReviewService(ReviewRepository reviewRepository, FarmRepository farmRepository,
            ReservationRepository reservationRepository) {
        this.reviewRepository = reviewRepository;
        this.farmRepository = farmRepository;
        this.reservationRepository = reservationRepository;
    }

    /**
     * レビューを投稿（体験済みユーザーのみ可能）
     */
    public Review createReview(User user, Long farmId, Integer rating, String comment) {
        Farm farm = farmRepository.findById(farmId)
                .orElseThrow(() -> new RuntimeException("Farm not found"));

        // 体験済み（COMPLETED）の予約があるかチェック
        boolean hasCompleted = reservationRepository.existsByUserIdAndFarmIdAndStatus(
                user.getId(), farmId, ReservationStatus.COMPLETED);

        if (!hasCompleted) {
            throw new RuntimeException("この農園での体験を完了してからレビューを投稿できます");
        }

        // 既にレビュー済みの場合は更新
        Review review = reviewRepository.findByUserAndFarm(user, farm)
                .orElse(new Review());

        review.setUser(user);
        review.setFarm(farm);
        review.setRating(rating);
        review.setComment(comment);

        return reviewRepository.save(review);
    }

    /**
     * レビューを削除
     */
    public void deleteReview(User user, Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        // 本人または管理者のみ削除可能
        if (!review.getUser().getId().equals(user.getId()) && user.getRole() != User.Role.ADMIN) {
            throw new RuntimeException("Not authorized to delete this review");
        }

        reviewRepository.delete(review);
    }

    /**
     * 農園のレビュー一覧取得
     */
    @Transactional(readOnly = true)
    public List<Review> getReviewsByFarm(Long farmId) {
        Farm farm = farmRepository.findById(farmId)
                .orElseThrow(() -> new RuntimeException("Farm not found"));

        return reviewRepository.findByFarmOrderByCreatedAtDesc(farm);
    }

    /**
     * 農園の平均評価を取得
     */
    @Transactional(readOnly = true)
    public Double getAverageRating(Long farmId) {
        Farm farm = farmRepository.findById(farmId).orElse(null);
        if (farm == null)
            return null;

        return reviewRepository.getAverageRatingByFarm(farm);
    }

    /**
     * 農園のレビュー数を取得
     */
    @Transactional(readOnly = true)
    public Long getReviewCount(Long farmId) {
        Farm farm = farmRepository.findById(farmId).orElse(null);
        if (farm == null)
            return 0L;

        return reviewRepository.getReviewCountByFarm(farm);
    }

    /**
     * 複数農園の評価情報を一括取得
     */
    @Transactional(readOnly = true)
    public Map<Long, double[]> getRatingsForFarms(List<Long> farmIds) {
        List<Object[]> results = reviewRepository.getAverageRatingsForFarms(farmIds);
        Map<Long, double[]> ratingsMap = new HashMap<>();

        for (Object[] result : results) {
            Long farmId = (Long) result[0];
            Double avgRating = (Double) result[1];
            Long count = (Long) result[2];
            ratingsMap.put(farmId, new double[] { avgRating, count });
        }

        return ratingsMap;
    }

    /**
     * ユーザーがこの農園にレビュー済みかチェック
     */
    @Transactional(readOnly = true)
    public boolean hasUserReviewed(User user, Long farmId) {
        Farm farm = farmRepository.findById(farmId).orElse(null);
        if (farm == null)
            return false;

        return reviewRepository.existsByUserAndFarm(user, farm);
    }
}
