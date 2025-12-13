package com.farmeet.controller;

import com.farmeet.dto.ChatRequest;
import com.farmeet.dto.ChatResponse;
import com.farmeet.service.AiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "${frontend.url}")
public class AiController {

    private final AiService aiService;

    @Autowired
    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        if (request.getMessage() == null || request.getMessage().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ChatResponse.error("メッセージを入力してください"));
        }

        ChatResponse response = aiService.chat(request);

        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.ok(response); // Return 200 even for handled errors
        }
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("AI service is running");
    }

    /**
     * 検索欄からのAIレコメンド用エンドポイント
     */
    @PostMapping("/recommend")
    public ResponseEntity<ChatResponse> recommend(@RequestBody RecommendRequest request) {
        if (request.getQuery() == null || request.getQuery().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ChatResponse.error("検索キーワードを入力してください"));
        }

        ChatResponse response = aiService.recommend(request.getQuery());
        return ResponseEntity.ok(response);
    }

    @lombok.Data
    public static class RecommendRequest {
        private String query;
    }
}
