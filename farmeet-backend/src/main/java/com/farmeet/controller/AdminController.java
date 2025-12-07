package com.farmeet.controller;

import com.farmeet.entity.Farm;
import com.farmeet.entity.User;
import com.farmeet.dto.FarmDto;
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

    @GetMapping("/users/deleted")
    public List<User> getDeletedUsers() {
        return adminService.getDeletedUsers();
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/farms")
    public List<FarmDto> getAllFarms() {
        return adminService.getAllFarms();
    }

    @GetMapping("/farms/deleted")
    public List<FarmDto> getDeletedFarms() {
        return adminService.getDeletedFarms();
    }

    @DeleteMapping("/farms/{id}")
    public ResponseEntity<Void> deleteFarm(@PathVariable Long id) {
        adminService.deleteFarm(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/users/{id}/restore")
    public ResponseEntity<Void> restoreUser(@PathVariable Long id) {
        adminService.restoreUser(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/farms/{id}/restore")
    public ResponseEntity<Void> restoreFarm(@PathVariable Long id) {
        adminService.restoreFarm(id);
        return ResponseEntity.ok().build();
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

    @PostMapping("/users")
    public User createUser(@RequestBody CreateUserRequest request) {
        return adminService.createUser(
                request.getUsername(),
                request.getEmail(),
                request.getPassword(),
                request.getRole());
    }

    @PutMapping("/users/{id}")
    public User updateUser(@PathVariable Long id, @RequestBody UpdateUserRequest request) {
        return adminService.updateUser(
                id,
                request.getUsername(),
                request.getEmail(),
                request.getRole());
    }

    @PutMapping("/farms/{id}")
    public Farm updateFarm(@PathVariable Long id, @RequestBody UpdateFarmRequest request) {
        return adminService.updateFarm(
                id,
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

    public static class UpdateFarmRequest {
        private String name;
        private String description;
        private String location;
        private String imageUrl;
        private Long ownerId;

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

    public static class CreateUserRequest {
        private String username;
        private String email;
        private String password;
        private User.Role role;

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }

        public User.Role getRole() {
            return role;
        }

        public void setRole(User.Role role) {
            this.role = role;
        }
    }

    public static class UpdateUserRequest {
        private String username;
        private String email;
        private User.Role role;

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public User.Role getRole() {
            return role;
        }

        public void setRole(User.Role role) {
            this.role = role;
        }
    }

    @GetMapping("/events")
    public List<com.farmeet.dto.ExperienceEventDto> getAllEvents() {
        return adminService.getAllEvents();
    }

    @GetMapping("/events/deleted")
    public List<com.farmeet.dto.ExperienceEventDto> getDeletedEvents() {
        return adminService.getDeletedEvents();
    }

    @PostMapping("/events")
    public com.farmeet.entity.ExperienceEvent createEvent(@RequestBody CreateEventRequest request) {
        return adminService.createEventByAdmin(
                request.getFarmId(),
                request.getTitle(),
                request.getDescription(),
                request.getEventDate(),
                request.getCapacity(),
                request.getPrice(),
                request.getCategory());
    }

    @PutMapping("/events/{id}")
    public com.farmeet.entity.ExperienceEvent updateEvent(@PathVariable Long id,
            @RequestBody UpdateEventRequest request) {
        return adminService.updateEventByAdmin(
                id,
                request.getFarmId(),
                request.getTitle(),
                request.getDescription(),
                request.getEventDate(),
                request.getCapacity(),
                request.getPrice(),
                request.getCategory());
    }

    @DeleteMapping("/events/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        adminService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/events/{id}/restore")
    public ResponseEntity<Void> restoreEvent(@PathVariable Long id) {
        adminService.restoreEvent(id);
        return ResponseEntity.ok().build();
    }

    // Event Request DTOs
    public static class CreateEventRequest {
        private Long farmId;
        private String title;
        private String description;
        private java.time.LocalDateTime eventDate;
        private Integer capacity;
        private java.math.BigDecimal price;
        private String category;

        // Getters and Setters
        public Long getFarmId() {
            return farmId;
        }

        public void setFarmId(Long farmId) {
            this.farmId = farmId;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public java.time.LocalDateTime getEventDate() {
            return eventDate;
        }

        public void setEventDate(java.time.LocalDateTime eventDate) {
            this.eventDate = eventDate;
        }

        public Integer getCapacity() {
            return capacity;
        }

        public void setCapacity(Integer capacity) {
            this.capacity = capacity;
        }

        public java.math.BigDecimal getPrice() {
            return price;
        }

        public void setPrice(java.math.BigDecimal price) {
            this.price = price;
        }

        public String getCategory() {
            return category;
        }

        public void setCategory(String category) {
            this.category = category;
        }
    }

    public static class UpdateEventRequest {
        private Long farmId;
        private String title;
        private String description;
        private java.time.LocalDateTime eventDate;
        private Integer capacity;
        private java.math.BigDecimal price;
        private String category;

        // Getters and Setters
        public Long getFarmId() {
            return farmId;
        }

        public void setFarmId(Long farmId) {
            this.farmId = farmId;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public java.time.LocalDateTime getEventDate() {
            return eventDate;
        }

        public void setEventDate(java.time.LocalDateTime eventDate) {
            this.eventDate = eventDate;
        }

        public Integer getCapacity() {
            return capacity;
        }

        public void setCapacity(Integer capacity) {
            this.capacity = capacity;
        }

        public java.math.BigDecimal getPrice() {
            return price;
        }

        public void setPrice(java.math.BigDecimal price) {
            this.price = price;
        }

        public String getCategory() {
            return category;
        }

        public void setCategory(String category) {
            this.category = category;
        }
    }
}
