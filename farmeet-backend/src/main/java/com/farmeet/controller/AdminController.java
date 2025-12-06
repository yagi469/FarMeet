package com.farmeet.controller;

import com.farmeet.entity.Farm;
import com.farmeet.entity.User;
import com.farmeet.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/users")
    public List<User> getAllUsers() {
        return adminService.getAllUsers();
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/farms")
    public List<Farm> getAllFarms() {
        return adminService.getAllFarms();
    }

    @DeleteMapping("/farms/{id}")
    public ResponseEntity<Void> deleteFarm(@PathVariable Long id) {
        adminService.deleteFarm(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/farms")
    public Farm createFarm(@RequestBody CreateFarmRequest request) {
        return adminService.createFarmByAdmin(
                request.getName(),
                request.getDescription(),
                request.getLocation(),
                request.getImageUrl(),
                request.getOwnerId());
    }

    @GetMapping("/stats")
    public Map<String, Long> getStats() {
        return adminService.getStats();
    }

    // Request DTO definition
    public static class CreateFarmRequest {
        private String name;
        private String description;
        private String location;
        private String imageUrl;
        private Long ownerId;

        // Getters and Setters
        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public String getLocation() {
            return location;
        }

        public void setLocation(String location) {
            this.location = location;
        }

        public String getImageUrl() {
            return imageUrl;
        }

        public void setImageUrl(String imageUrl) {
            this.imageUrl = imageUrl;
        }

        public Long getOwnerId() {
            return ownerId;
        }

        public void setOwnerId(Long ownerId) {
            this.ownerId = ownerId;
        }
    }
}
