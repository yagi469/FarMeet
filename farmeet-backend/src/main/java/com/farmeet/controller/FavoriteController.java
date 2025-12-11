package com.farmeet.controller;

import com.farmeet.dto.FarmDto;
import com.farmeet.entity.Favorite;
import com.farmeet.entity.User;
import com.farmeet.service.FavoriteService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/favorites")
public class FavoriteController {

    private final FavoriteService favoriteService;

    public FavoriteController(FavoriteService favoriteService) {
        this.favoriteService = favoriteService;
    }

    /**
     * お気に入り一覧取得
     */
    @GetMapping
    public ResponseEntity<List<FarmDto>> getFavorites(@AuthenticationPrincipal User user) {
        List<Favorite> favorites = favoriteService.getFavorites(user);
        List<FarmDto> farms = favorites.stream()
                .map(f -> FarmDto.fromEntity(f.getFarm()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(farms);
    }

    /**
     * お気に入り追加
     */
    @PostMapping("/{farmId}")
    public ResponseEntity<Map<String, Object>> addFavorite(
            @AuthenticationPrincipal User user,
            @PathVariable Long farmId) {
        favoriteService.addFavorite(user, farmId);
        return ResponseEntity.ok(Map.of("success", true, "farmId", farmId));
    }

    /**
     * お気に入り解除
     */
    @DeleteMapping("/{farmId}")
    public ResponseEntity<Map<String, Object>> removeFavorite(
            @AuthenticationPrincipal User user,
            @PathVariable Long farmId) {
        favoriteService.removeFavorite(user, farmId);
        return ResponseEntity.ok(Map.of("success", true, "farmId", farmId));
    }

    /**
     * 複数農園のお気に入り状態を一括チェック
     */
    @GetMapping("/check")
    public ResponseEntity<Map<String, Object>> checkFavorites(
            @AuthenticationPrincipal User user,
            @RequestParam List<Long> farmIds) {
        if (user == null) {
            return ResponseEntity.ok(Map.of("favoriteIds", List.of()));
        }
        List<Long> favoriteIds = favoriteService.getFavoriteFarmIds(user, farmIds);
        return ResponseEntity.ok(Map.of("favoriteIds", favoriteIds));
    }
}
