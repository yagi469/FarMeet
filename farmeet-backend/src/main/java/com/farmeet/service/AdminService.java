package com.farmeet.service;

import com.farmeet.entity.Farm;
import com.farmeet.entity.User;
import com.farmeet.dto.FarmDto;
import com.farmeet.dto.UserDto;
import com.farmeet.exception.ResourceNotFoundException;
import com.farmeet.repository.FarmRepository;
import com.farmeet.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class AdminService {

    private final UserRepository userRepository;
    private final FarmRepository farmRepository;
    private final com.farmeet.repository.ExperienceEventRepository experienceEventRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
    @jakarta.persistence.PersistenceContext
    private jakarta.persistence.EntityManager entityManager;

    public AdminService(UserRepository userRepository, FarmRepository farmRepository,
            com.farmeet.repository.ExperienceEventRepository experienceEventRepository,
            org.springframework.security.crypto.password.PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.farmRepository = farmRepository;
        this.experienceEventRepository = experienceEventRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        // Delete all farms (and their events) owned by this user
        List<Farm> farms = farmRepository.findByOwner(user);
        for (Farm farm : farms) {
            deleteFarm(farm.getId());
        }

        userRepository.delete(user);
    }

    public void restoreUser(Long id) {
        // Native query to bypass @Where clause and directly update
        entityManager.createNativeQuery("UPDATE users SET deleted = false WHERE id = :id")
                .setParameter("id", id)
                .executeUpdate();
        // Also restore owned farms? Depends on policy. For now, manual restore might be
        // safer or restore based on logic.
        // Let's keep it simple: Restore User only. Child entities might need manual
        // restore or logic.
        // Actually, if we soft-deleted farms when user was deleted, we might want to
        // restore them.
        // But finding which ones were deleted *at that time* vs separately is hard.
        // Let's just restore the user for now.
    }

    public void restoreFarm(Long id) {
        entityManager.createNativeQuery("UPDATE farms SET deleted = false WHERE id = :id")
                .setParameter("id", id)
                .executeUpdate();
    }

    public List<FarmDto> getAllFarms() {
        List<Farm> farms = farmRepository.findAll();
        return farms.stream().map(farm -> {
            FarmDto dto = new FarmDto();
            dto.setId(farm.getId());
            dto.setName(farm.getName());
            dto.setDescription(farm.getDescription());
            dto.setLocation(farm.getLocation());
            dto.setImageUrl(farm.getImageUrl());
            if (farm.getOwner() != null) {
                dto.setOwner(UserDto.fromEntity(farm.getOwner()));
            }
            return dto;
        }).toList();
    }

    public void deleteFarm(Long id) {
        Farm farm = farmRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Farm not found with id: " + id));

        // Delete all events associated with this farm
        List<com.farmeet.entity.ExperienceEvent> events = experienceEventRepository.findByFarm(farm);
        experienceEventRepository.deleteAll(events);

        farmRepository.delete(farm);
    }

    public User createUser(String username, String email, String password, User.Role role) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Email already in use");
        }
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        if (role != null) {
            user.setRole(role);
        } else {
            user.setRole(User.Role.USER);
        }
        return userRepository.save(user);
    }

    public User updateUser(Long id, String username, String email, User.Role role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        if (username != null && !username.isEmpty())
            user.setUsername(username);
        if (email != null && !email.isEmpty()) {
            // Check if email is taken by another user
            userRepository.findByEmail(email).ifPresent(u -> {
                if (!u.getId().equals(id))
                    throw new IllegalArgumentException("Email already in use");
            });
            user.setEmail(email);
        }
        if (role != null)
            user.setRole(role);
        return userRepository.save(user);
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

    public Farm updateFarm(Long id, String name, String description, String location, String imageUrl, Long ownerId) {
        Farm farm = farmRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Farm not found with id: " + id));

        if (name != null)
            farm.setName(name);
        if (description != null)
            farm.setDescription(description);
        if (location != null)
            farm.setLocation(location);
        if (imageUrl != null)
            farm.setImageUrl(imageUrl);
        if (ownerId != null) {
            User owner = userRepository.findById(ownerId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + ownerId));
            farm.setOwner(owner);
        }
        return farmRepository.save(farm);
    }

    public Map<String, Long> getStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalFarms", farmRepository.count());
        // 将来的には予約数なども追加
        return stats;
    }

    @SuppressWarnings("unchecked")
    public List<User> getDeletedUsers() {
        return entityManager.createNativeQuery("SELECT * FROM users WHERE deleted = true", User.class).getResultList();
    }

    @SuppressWarnings("unchecked")
    public List<FarmDto> getDeletedFarms() {
        // Use native query to get all deleted farms
        String sql = "SELECT f.* FROM farms f WHERE f.deleted = true";
        List<Farm> deletedFarms = entityManager.createNativeQuery(sql, Farm.class).getResultList();

        List<FarmDto> dtos = new ArrayList<>();

        for (Farm farm : deletedFarms) {
            FarmDto dto = new FarmDto();
            dto.setId(farm.getId());
            dto.setName(farm.getName());
            dto.setDescription(farm.getDescription());
            dto.setLocation(farm.getLocation());
            dto.setImageUrl(farm.getImageUrl());

            // For each farm, manually load the owner ignoring the restriction
            try {
                Object ownerIdObj = entityManager.createNativeQuery("SELECT owner_id FROM farms WHERE id = :farmId")
                        .setParameter("farmId", farm.getId())
                        .getSingleResult();

                if (ownerIdObj != null) {
                    Long ownerId = ((Number) ownerIdObj).longValue();
                    // Fetch the user natively to bypass @SQLRestriction
                    List<User> owners = entityManager
                            .createNativeQuery("SELECT * FROM users WHERE id = :id", User.class)
                            .setParameter("id", ownerId)
                            .getResultList();
                    if (!owners.isEmpty()) {
                        dto.setOwner(UserDto.fromEntity(owners.get(0)));
                    }
                }
            } catch (Exception e) {
                // Log or handle error, e.g owner might be hard deleted (unlikely given soft
                // delete)
                System.err.println("Error fetching owner for deleted farm " + farm.getId() + ": " + e.getMessage());
            }
            dtos.add(dto);
        }

        return dtos;
    }
}
