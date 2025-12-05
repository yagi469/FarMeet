package com.farmeet.service;

import com.farmeet.entity.ExperienceEvent;
import com.farmeet.entity.Farm;
import com.farmeet.entity.User;
import com.farmeet.repository.ExperienceEventRepository;
import com.farmeet.repository.FarmRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class FarmService {

    @Autowired
    private FarmRepository farmRepository;

    @Autowired
    private ExperienceEventRepository eventRepository;

    public List<Farm> getAllFarms() {
        return farmRepository.findAll();
    }

    public Farm getFarmById(Long id) {
        return farmRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Farm not found"));
    }

    public Farm createFarm(Farm farm, User owner) {
        farm.setOwner(owner);
        return farmRepository.save(farm);
    }

    public List<Farm> getFarmsByOwner(Long ownerId) {
        return farmRepository.findByOwnerId(ownerId);
    }

    public Farm updateFarm(Long id, Farm farmData, User user) {
        Farm farm = farmRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Farm not found"));

        if (!farm.getOwner().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        farm.setName(farmData.getName());
        farm.setDescription(farmData.getDescription());
        farm.setLocation(farmData.getLocation());
        farm.setImageUrl(farmData.getImageUrl());

        return farmRepository.save(farm);
    }

    public void deleteFarm(Long id, User user) {
        Farm farm = farmRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Farm not found"));

        if (!farm.getOwner().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        farmRepository.delete(farm);
    }

    // 検索機能（キーワード、地域、日程、人数、カテゴリで絞り込み）
    public List<Farm> searchFarms(String keyword, String location, LocalDate date, Integer guests, String category) {
        List<Farm> farms;
        int totalGuests = guests != null ? guests : 0;
        boolean hasCategory = category != null && !category.isEmpty();

        // まず日程、人数、カテゴリで絞り込み
        if (date != null) {
            LocalDateTime startOfDay = date.atStartOfDay();
            LocalDateTime endOfDay = date.plusDays(1).atStartOfDay();

            List<ExperienceEvent> events;
            if (hasCategory && totalGuests > 0) {
                events = eventRepository.findByEventDateBetweenAndCategoryAndMinSlots(startOfDay, endOfDay, category,
                        totalGuests);
            } else if (hasCategory) {
                events = eventRepository.findByEventDateBetweenAndCategory(startOfDay, endOfDay, category);
            } else if (totalGuests > 0) {
                events = eventRepository.findByEventDateBetweenAndMinSlots(startOfDay, endOfDay, totalGuests);
            } else {
                events = eventRepository.findByEventDateBetween(startOfDay, endOfDay);
            }

            Set<Long> farmIds = events.stream()
                    .map(e -> e.getFarm().getId())
                    .collect(Collectors.toSet());
            farms = farmRepository.findAllById(farmIds);
        } else if (hasCategory && totalGuests > 0) {
            List<Long> farmIds = eventRepository.findFarmIdsByCategoryAndMinSlots(category, totalGuests,
                    LocalDateTime.now());
            farms = farmRepository.findAllById(farmIds);
        } else if (hasCategory) {
            List<Long> farmIds = eventRepository.findFarmIdsByCategory(category, LocalDateTime.now());
            farms = farmRepository.findAllById(farmIds);
        } else if (totalGuests > 0) {
            List<Long> farmIds = eventRepository.findFarmIdsByMinSlots(totalGuests, LocalDateTime.now());
            farms = farmRepository.findAllById(farmIds);
        } else {
            farms = farmRepository.findAll();
        }

        // キーワードで絞り込み
        if (keyword != null && !keyword.isEmpty()) {
            String lowerKeyword = keyword.toLowerCase();
            farms = farms.stream()
                    .filter(farm -> farm.getName().toLowerCase().contains(lowerKeyword) ||
                            farm.getLocation().toLowerCase().contains(lowerKeyword) ||
                            farm.getDescription().toLowerCase().contains(lowerKeyword))
                    .collect(Collectors.toList());
        }

        // 地域で絞り込み
        if (location != null && !location.isEmpty()) {
            farms = farms.stream()
                    .filter(farm -> farm.getLocation().contains(location))
                    .collect(Collectors.toList());
        }

        return farms;
    }

    // 地域一覧を取得（重複なし）
    public List<String> getLocations() {
        return farmRepository.findAll()
                .stream()
                .map(Farm::getLocation)
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }
}
