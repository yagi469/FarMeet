package com.farmeet.dto;

import com.farmeet.entity.Farm;
import lombok.Data;

@Data
public class FarmDto {
    private Long id;
    private String name;
    private String description;
    private String location;
    private String imageUrl;
    private UserDto owner;

    public static FarmDto fromEntity(Farm farm) {
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
    }
}
