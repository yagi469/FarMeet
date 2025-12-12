package com.farmeet.dto;

import lombok.Data;
import java.util.List;

@Data
public class ChatRequest {
    private String message;
    private List<ChatMessage> history;

    @Data
    public static class ChatMessage {
        private String role; // "user" or "assistant"
        private String content;
    }
}
