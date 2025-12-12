package com.farmeet.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatResponse {
    private String message;
    private List<FarmSuggestion> suggestions;
    private boolean success;
    private String error;

    public static ChatResponse success(String message) {
        return new ChatResponse(message, null, true, null);
    }

    public static ChatResponse success(String message, List<FarmSuggestion> suggestions) {
        return new ChatResponse(message, suggestions, true, null);
    }

    public static ChatResponse error(String error) {
        return new ChatResponse(null, null, false, error);
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FarmSuggestion {
        private Long id;
        private String name;
        private String location;
        private String imageUrl;
    }
}
