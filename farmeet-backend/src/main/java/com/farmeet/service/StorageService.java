package com.farmeet.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Service
public class StorageService {

    @Value("${supabase.url:}")
    private String supabaseUrl;

    @Value("${supabase.key:}")
    private String supabaseKey;

    @Value("${supabase.bucket:farmeet-images}")
    private String bucketName;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Upload an image to Supabase Storage
     * 
     * @param file   The image file to upload
     * @param folder Subfolder (e.g., "farms", "events", "avatars")
     * @return Public URL of the uploaded image
     */
    public String uploadImage(MultipartFile file, String folder) {
        if (supabaseUrl == null || supabaseUrl.isEmpty() || supabaseKey == null || supabaseKey.isEmpty()) {
            throw new RuntimeException("Supabase configuration is missing. Set SUPABASE_URL and SUPABASE_KEY.");
        }

        try {
            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename != null && originalFilename.contains(".")
                    ? originalFilename.substring(originalFilename.lastIndexOf("."))
                    : ".jpg";
            String filename = folder + "/" + UUID.randomUUID().toString() + extension;

            // Build upload URL
            String uploadUrl = supabaseUrl + "/storage/v1/object/" + bucketName + "/" + filename;

            // Set headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(
                    MediaType.parseMediaType(file.getContentType() != null ? file.getContentType() : "image/jpeg"));
            headers.set("Authorization", "Bearer " + supabaseKey);
            headers.set("x-upsert", "true");

            // Create request entity
            HttpEntity<byte[]> requestEntity = new HttpEntity<>(file.getBytes(), headers);

            // Upload file
            ResponseEntity<String> response = restTemplate.exchange(
                    uploadUrl,
                    HttpMethod.POST,
                    requestEntity,
                    String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                // Return public URL
                return supabaseUrl + "/storage/v1/object/public/" + bucketName + "/" + filename;
            } else {
                throw new RuntimeException("Failed to upload image: " + response.getStatusCode());
            }
        } catch (Exception e) {
            throw new RuntimeException("Error uploading image: " + e.getMessage(), e);
        }
    }

    /**
     * Delete an image from Supabase Storage
     * 
     * @param imageUrl The full URL of the image to delete
     */
    public void deleteImage(String imageUrl) {
        if (supabaseUrl == null || supabaseUrl.isEmpty() || supabaseKey == null || supabaseKey.isEmpty()) {
            System.out.println("Supabase configuration is missing. Skipping image deletion.");
            return;
        }

        try {
            // Extract the file path from the URL
            String prefix = supabaseUrl + "/storage/v1/object/public/" + bucketName + "/";
            if (!imageUrl.startsWith(prefix)) {
                System.out.println("Image URL is not from Supabase Storage. Skipping deletion.");
                return;
            }

            String filePath = imageUrl.substring(prefix.length());
            String deleteUrl = supabaseUrl + "/storage/v1/object/" + bucketName + "/" + filePath;

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + supabaseKey);

            HttpEntity<Void> requestEntity = new HttpEntity<>(headers);

            restTemplate.exchange(deleteUrl, HttpMethod.DELETE, requestEntity, String.class);
            System.out.println("Deleted image: " + filePath);

        } catch (Exception e) {
            System.out.println("Error deleting image: " + e.getMessage());
        }
    }
}
