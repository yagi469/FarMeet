package com.farmeet.repository;

import com.farmeet.entity.Farm;
import com.farmeet.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FarmRepository extends JpaRepository<Farm, Long> {
    List<Farm> findByOwnerId(Long ownerId);

    List<Farm> findByOwner(User owner);

    Farm findByName(String name);

    // キーワード検索（農園名、地域、説明文で部分一致）
    List<Farm> findByNameContainingOrLocationContainingOrDescriptionContaining(
            String name, String location, String description);

    // 地域で絞り込み
    List<Farm> findByLocationContaining(String location);
}
