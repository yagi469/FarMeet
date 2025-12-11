package com.farmeet.service;

import com.farmeet.entity.Farm;
import com.farmeet.entity.Favorite;
import com.farmeet.entity.User;
import com.farmeet.repository.FarmRepository;
import com.farmeet.repository.FavoriteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final FarmRepository farmRepository;

    public FavoriteService(FavoriteRepository favoriteRepository, FarmRepository farmRepository) {
        this.favoriteRepository = favoriteRepository;
        this.farmRepository = farmRepository;
    }

    /**
     * お気に入りに追加
     */
    public Favorite addFavorite(User user, Long farmId) {
        Farm farm = farmRepository.findById(farmId)
                .orElseThrow(() -> new RuntimeException("Farm not found"));

        // 既にお気に入りに追加されている場合は何もしない
        if (favoriteRepository.existsByUserAndFarm(user, farm)) {
            return favoriteRepository.findByUserAndFarm(user, farm).orElse(null);
        }

        Favorite favorite = new Favorite();
        favorite.setUser(user);
        favorite.setFarm(farm);
        return favoriteRepository.save(favorite);
    }

    /**
     * お気に入りから削除
     */
    public void removeFavorite(User user, Long farmId) {
        Farm farm = farmRepository.findById(farmId)
                .orElseThrow(() -> new RuntimeException("Farm not found"));

        favoriteRepository.deleteByUserAndFarm(user, farm);
    }

    /**
     * お気に入り一覧取得
     */
    @Transactional(readOnly = true)
    public List<Favorite> getFavorites(User user) {
        return favoriteRepository.findByUserOrderByCreatedAtDesc(user);
    }

    /**
     * お気に入りかどうか判定
     */
    @Transactional(readOnly = true)
    public boolean isFavorite(User user, Long farmId) {
        Farm farm = farmRepository.findById(farmId).orElse(null);
        if (farm == null) {
            return false;
        }
        return favoriteRepository.existsByUserAndFarm(user, farm);
    }

    /**
     * 複数の農園のお気に入り状態を一括チェック
     */
    @Transactional(readOnly = true)
    public List<Long> getFavoriteFarmIds(User user, List<Long> farmIds) {
        return favoriteRepository.findFarmIdsByUserAndFarmIdIn(user, farmIds);
    }
}
