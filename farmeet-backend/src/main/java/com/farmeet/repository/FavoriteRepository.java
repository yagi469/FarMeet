package com.farmeet.repository;

import com.farmeet.entity.Farm;
import com.farmeet.entity.Favorite;
import com.farmeet.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    List<Favorite> findByUserOrderByCreatedAtDesc(User user);

    Optional<Favorite> findByUserAndFarm(User user, Farm farm);

    boolean existsByUserAndFarm(User user, Farm farm);

    void deleteByUserAndFarm(User user, Farm farm);

    @Query("SELECT f.farm.id FROM Favorite f WHERE f.user = :user AND f.farm.id IN :farmIds")
    List<Long> findFarmIdsByUserAndFarmIdIn(@Param("user") User user, @Param("farmIds") List<Long> farmIds);
}
