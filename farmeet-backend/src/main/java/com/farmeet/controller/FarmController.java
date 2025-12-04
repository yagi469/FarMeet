package com.farmeet.controller;

import com.farmeet.entity.Farm;
import com.farmeet.entity.User;
import com.farmeet.service.FarmService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/farms")
public class FarmController {

    @Autowired
    private FarmService farmService;

    @GetMapping
    public ResponseEntity<List<Farm>> getAllFarms() {
        return ResponseEntity.ok(farmService.getAllFarms());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Farm> getFarmById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(farmService.getFarmById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<Farm> createFarm(@RequestBody Farm farm,
            @AuthenticationPrincipal User user) {
        Farm createdFarm = farmService.createFarm(farm, user);
        return ResponseEntity.ok(createdFarm);
    }

    @GetMapping("/my-farms")
    public ResponseEntity<List<Farm>> getMyFarms(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(farmService.getFarmsByOwner(user.getId()));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Farm>> searchFarms(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<Farm> farms = farmService.searchFarms(keyword, location, date);
        return ResponseEntity.ok(farms);
    }

    @GetMapping("/locations")
    public ResponseEntity<List<String>> getLocations() {
        List<String> locations = farmService.getLocations();
        return ResponseEntity.ok(locations);
    }
}
