package com.farmeet.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.google.genai.Client;

@Configuration
public class GeminiConfig {

    @Value("${gemini.api-key:}")
    private String apiKey;

    @Value("${gemini.model:gemini-2.0-flash-lite}")
    private String model;

    @Bean
    public Client geminiClient() {
        if (apiKey == null || apiKey.isEmpty()) {
            System.out.println("WARNING: GEMINI_API_KEY is not configured. AI chat will be disabled.");
            return null;
        }
        // Use builder to pass API key directly
        return Client.builder().apiKey(apiKey).build();
    }

    public String getModel() {
        return model;
    }

    public String getApiKey() {
        return apiKey;
    }
}
