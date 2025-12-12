package com.farmeet.dto;

import java.util.List;

import com.farmeet.entity.Farm;
import lombok.Data;

@Data
public class FarmDto {
    private Long id;
    private String name;
    private String description;
    private String location;
    private String imageUrl;
    private List<String> images;
    private List<String> features;
    private Double latitude;
    private Double longitude;
    private UserDto owner;

    public static FarmDto fromEntity(Farm farm) {
        FarmDto dto = new FarmDto();
        dto.setId(farm.getId());
        dto.setName(farm.getName());
        dto.setDescription(farm.getDescription());
        dto.setLocation(farm.getLocation());
        dto.setImageUrl(farm.getImageUrl());
        dto.setImages(farm.getImages());
        dto.setFeatures(farm.getFeatures());
        dto.setLatitude(farm.getLatitude());
        dto.setLongitude(farm.getLongitude());
        if (farm.getOwner() != null) {
            dto.setOwner(UserDto.fromEntity(farm.getOwner()));
        }
        return dto;
    }
}
