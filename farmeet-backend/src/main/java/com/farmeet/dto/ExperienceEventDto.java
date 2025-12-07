package com.farmeet.dto;

import com.farmeet.entity.ExperienceEvent;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ExperienceEventDto {
    private Long id;
    private String title;
    private String description;
    private LocalDateTime eventDate;
    private Integer capacity;
    private BigDecimal price;
    private Integer availableSlots;
    private String category;
    private Long farmId; // We send only ID to avoid deep nesting/recursion

    public static ExperienceEventDto fromEntity(ExperienceEvent event) {
        ExperienceEventDto dto = new ExperienceEventDto();
        dto.setId(event.getId());
        dto.setTitle(event.getTitle());
        dto.setDescription(event.getDescription());
        dto.setEventDate(event.getEventDate());
        dto.setCapacity(event.getCapacity());
        dto.setPrice(event.getPrice());
        dto.setAvailableSlots(event.getAvailableSlots());
        dto.setCategory(event.getCategory());
        if (event.getFarm() != null) {
            dto.setFarmId(event.getFarm().getId());
        }
        return dto;
    }
}
