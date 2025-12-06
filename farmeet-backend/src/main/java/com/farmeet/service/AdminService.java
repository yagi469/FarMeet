package com.farmeet.service;

import com.farmeet.entity.Farm;
import com.farmeet.entity.User;
import com.farmeet.exception.ResourceNotFoundException;
import com.farmeet.repository.FarmRepository;
import com.farmeet.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class AdminService {

    private final UserRepository userRepository;
    private final FarmRepository farmRepository;

    public AdminService(UserRepository userRepository, FarmRepository farmRepository) {
        this.userRepository = userRepository;
        this.farmRepository = farmRepository;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        // 農園所有者の場合、農園も削除するかどうかの仕様検討が必要だが、
        // 簡略化のため、Cascade設定に依存するか、ここで削除する。
        // リスク回避のため、一旦はユーザー削除のみ行う（Cascade設定によっては関連データも消える）
        userRepository.delete(user);
    }

    public List<Farm> getAllFarms() {
        return farmRepository.findAll();
    }

    public void deleteFarm(Long id) {
        Farm farm = farmRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Farm not found with id: " + id));
        farmRepository.delete(farm);
    }

    public Farm createFarmByAdmin(String name, String description, String location, String imageUrl, Long ownerId) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + ownerId));

        Farm farm = new Farm();
        farm.setName(name);
        farm.setDescription(description);
        farm.setLocation(location);
        farm.setImageUrl(imageUrl);
        farm.setOwner(owner);
        return farmRepository.save(farm);
    }

    public Map<String, Long> getStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalFarms", farmRepository.count());
        // 将来的には予約数なども追加
        return stats;
    }
}
