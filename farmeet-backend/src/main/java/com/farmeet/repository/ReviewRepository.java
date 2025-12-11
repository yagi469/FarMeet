package com.farmeet.repository;

import com.farmeet.entity.Farm;
import com.farmeet.entity.Review;
import com.farmeet.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByFarmOrderByCreatedAtDesc(Farm farm);

    Optional<Review> findByUserAndFarm(User user, Farm farm);

    boolean existsByUserAndFarm(User user, Farm farm);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.farm = :farm")
    Double getAverageRatingByFarm(@Param("farm") Farm farm);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.farm = :farm")
    Long getReviewCountByFarm(@Param("farm") Farm farm);

    @Query("SELECT r.farm.id, AVG(r.rating), COUNT(r) FROM Review r WHERE r.farm.id IN :farmIds GROUP BY r.farm.id")
    List<Object[]> getAverageRatingsForFarms(@Param("farmIds") List<Long> farmIds);
}
