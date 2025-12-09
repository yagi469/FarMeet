package com.farmeet.controller;

import com.farmeet.service.StorageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/upload")
public class ImageUploadController {

    private final StorageService storageService;

    public ImageUploadController(StorageService storageService) {
        this.storageService = storageService;
    }

    /**
     * Upload a single image
     * 
     * @param file   The image file
     * @param folder The folder to upload to (farms, events, avatars)
     * @return The public URL of the uploaded image
     */
    @PostMapping("/image")
    public ResponseEntity<Map<String, String>> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", defaultValue = "general") String folder) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No file provided"));
        }

        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Only image files are allowed"));
        }

        // Validate file size (max 5MB)
        if (file.getSize() > 5 * 1024 * 1024) {
            return ResponseEntity.badRequest().body(Map.of("error", "File size must be less than 5MB"));
        }

        try {
            String imageUrl = storageService.uploadImage(file, folder);
            Map<String, String> response = new HashMap<>();
            response.put("url", imageUrl);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Upload multiple images
     * 
     * @param files  The image files
     * @param folder The folder to upload to
     * @return List of public URLs
     */
    @PostMapping("/images")
    public ResponseEntity<Map<String, Object>> uploadMultipleImages(
            @RequestParam("files") MultipartFile[] files,
            @RequestParam(value = "folder", defaultValue = "general") String folder) {

        if (files == null || files.length == 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "No files provided"));
        }

        List<String> urls = new ArrayList<>();
        List<String> errors = new ArrayList<>();

        for (MultipartFile file : files) {
            if (file.isEmpty())
                continue;

            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                errors.add(file.getOriginalFilename() + ": Not an image file");
                continue;
            }

            if (file.getSize() > 5 * 1024 * 1024) {
                errors.add(file.getOriginalFilename() + ": File too large");
                continue;
            }

            try {
                String imageUrl = storageService.uploadImage(file, folder);
                urls.add(imageUrl);
            } catch (Exception e) {
                errors.add(file.getOriginalFilename() + ": " + e.getMessage());
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("urls", urls);
        if (!errors.isEmpty()) {
            response.put("errors", errors);
        }
        return ResponseEntity.ok(response);
    }

    /**
     * Delete an image
     * 
     * @param imageUrl The URL of the image to delete
     */
    @DeleteMapping("/image")
    public ResponseEntity<Map<String, String>> deleteImage(@RequestParam("url") String imageUrl) {
        try {
            storageService.deleteImage(imageUrl);
            return ResponseEntity.ok(Map.of("message", "Image deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}
