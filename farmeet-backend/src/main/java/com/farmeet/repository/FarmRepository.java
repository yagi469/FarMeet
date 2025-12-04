package com.farmeet.repository;

import com.farmeet.entity.Farm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FarmRepository extends JpaRepository<Farm, Long> {
    List<Farm> findByOwnerId(Long ownerId);

    Farm findByName(String name);
}
