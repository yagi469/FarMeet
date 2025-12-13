package com.farmeet.service;

import com.farmeet.config.GeminiConfig;
import com.farmeet.dto.ChatRequest;
import com.farmeet.dto.ChatResponse;
import com.farmeet.entity.Farm;
import com.farmeet.repository.FarmRepository;
import com.farmeet.repository.ReviewRepository;
import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class AiService {

    private final Client geminiClient;
    private final GeminiConfig geminiConfig;
    private final FarmRepository farmRepository;
    private final ReviewRepository reviewRepository;

    private static final String SYSTEM_PROMPT = """
            あなたは「FarMeet」の親切なAIアシスタントです。
            FarMeetは農園での収穫体験を予約できるサービスです。

            【できること】
            - 農園の検索・おすすめ
            - 予約方法のご案内
            - よくある質問への回答

            【回答ルール】
            - 簡潔で親しみやすい日本語で回答してください
            - 具体的な農園情報がある場合は名前と特徴を紹介してください
            - 予約については該当農園のページへ誘導してください
            - 不明な点は「お問い合わせフォームからご連絡ください」と案内してください

            【よくある質問への回答例】
            - 予約のキャンセル: 「予約は予約一覧ページからキャンセルできます。ただし、キャンセルポリシーは農園により異なりますのでご注意ください。」
            - 支払い方法: 「クレジットカード（Visa, Mastercard等）またはPayPayでお支払いいただけます。」
            - 持ち物: 「動きやすい服装、帽子、飲み物をお持ちください。詳細は各農園のページをご確認ください。」

            【利用可能な農園データ】
            %s
            """;

    private static final String CRITERIA_EXTRACTION_PROMPT = """
            ユーザーのメッセージから農園検索の条件を抽出してください。
            以下のJSON形式で出力してください（該当しない項目はnullにしてください）:

            {
                "crop": "収穫物（いちご、りんご、ぶどう、野菜など）",
                "location": "場所（長野、山梨など）",
                "familyFriendly": true/false,
                "keywords": ["その他のキーワード"]
            }

            ユーザーメッセージ: %s

            JSON形式で出力:
            """;

    private static final String REASON_GENERATION_PROMPT = """
            以下の農園について、ユーザーの検索条件に基づいたおすすめ理由を1〜2文で生成してください。

            農園名: %s
            農園の説明: %s
            ユーザーの検索条件: %s

            おすすめ理由（1〜2文で簡潔に）:
            """;

    @Autowired
    public AiService(Client geminiClient, GeminiConfig geminiConfig, FarmRepository farmRepository,
            ReviewRepository reviewRepository) {
        this.geminiClient = geminiClient;
        this.geminiConfig = geminiConfig;
        this.farmRepository = farmRepository;
        this.reviewRepository = reviewRepository;
    }

    public ChatResponse chat(ChatRequest request) {
        if (geminiClient == null) {
            return ChatResponse.error("AIサービスが設定されていません。管理者にお問い合わせください。");
        }

        try {
            // Build farm data context for RAG
            String farmContext = buildFarmContext();
            String systemPromptWithData = String.format(SYSTEM_PROMPT, farmContext);

            // Build conversation prompt including history
            StringBuilder promptBuilder = new StringBuilder();
            promptBuilder.append(systemPromptWithData);
            promptBuilder.append("\n\n");

            // Add history if present
            if (request.getHistory() != null && !request.getHistory().isEmpty()) {
                promptBuilder.append("【これまでの会話】\n");
                for (ChatRequest.ChatMessage msg : request.getHistory()) {
                    String role = "user".equals(msg.getRole()) ? "ユーザー" : "アシスタント";
                    promptBuilder.append(role).append(": ").append(msg.getContent()).append("\n");
                }
                promptBuilder.append("\n");
            }

            // Add current user message
            promptBuilder.append("【ユーザーの質問】\n").append(request.getMessage());

            // Call Gemini API with simple string content
            GenerateContentResponse response = geminiClient.models.generateContent(
                    geminiConfig.getModel(),
                    promptBuilder.toString(),
                    null // config
            );

            String aiResponse = response.text();

            // AI-powered farm suggestions
            List<ChatResponse.FarmSuggestion> suggestions = extractFarmSuggestionsWithAI(request.getMessage());

            return ChatResponse.success(aiResponse, suggestions.isEmpty() ? null : suggestions);

        } catch (Exception e) {
            e.printStackTrace();
            return ChatResponse.error("申し訳ありません。一時的なエラーが発生しました。しばらくしてからもう一度お試しください。");
        }
    }

    /**
     * 検索欄からのAIレコメンド用エンドポイント
     */
    public ChatResponse recommend(String query) {
        if (geminiClient == null) {
            return ChatResponse.error("AIサービスが設定されていません。");
        }

        try {
            List<ChatResponse.FarmSuggestion> suggestions = extractFarmSuggestionsWithAI(query);

            if (suggestions.isEmpty()) {
                return ChatResponse.success("条件に合う農園が見つかりませんでした。別の条件でお試しください。", null);
            }

            String message = String.format("%d件の農園がおすすめです！", suggestions.size());
            return ChatResponse.success(message, suggestions);

        } catch (Exception e) {
            e.printStackTrace();
            return ChatResponse.error("検索中にエラーが発生しました。");
        }
    }

    private String buildFarmContext() {
        List<Farm> farms = farmRepository.findAll();

        if (farms.isEmpty()) {
            return "（現在登録されている農園はありません）";
        }

        return farms.stream()
                .map(farm -> String.format(
                        "- %s（%s）: %s",
                        farm.getName(),
                        farm.getLocation(),
                        farm.getDescription() != null
                                ? farm.getDescription().substring(0, Math.min(100, farm.getDescription().length()))
                                : ""))
                .collect(Collectors.joining("\n"));
    }

    /**
     * AIを使用した農園サジェスト抽出
     */
    private List<ChatResponse.FarmSuggestion> extractFarmSuggestionsWithAI(String userMessage) {
        List<Farm> allFarms = farmRepository.findAll();
        if (allFarms.isEmpty()) {
            return new ArrayList<>();
        }

        // Check if this is a search-related message
        if (!isSearchRelatedMessage(userMessage)) {
            return new ArrayList<>();
        }

        // Extract search criteria using AI
        SearchCriteria criteria = extractSearchCriteria(userMessage);

        // Filter farms based on criteria
        List<Farm> matchingFarms = filterFarms(allFarms, criteria, userMessage);

        // Get ratings for matching farms
        List<Long> farmIds = matchingFarms.stream().map(Farm::getId).collect(Collectors.toList());
        Map<Long, double[]> ratingsMap = getRatingsMap(farmIds);

        // Sort by rating and limit to 3
        matchingFarms.sort((a, b) -> {
            double ratingA = ratingsMap.getOrDefault(a.getId(), new double[] { 0, 0 })[0];
            double ratingB = ratingsMap.getOrDefault(b.getId(), new double[] { 0, 0 })[0];
            return Double.compare(ratingB, ratingA);
        });

        // Build suggestions with reasons
        return matchingFarms.stream()
                .limit(3)
                .map(farm -> {
                    double[] ratingInfo = ratingsMap.getOrDefault(farm.getId(), new double[] { 0, 0 });
                    String reason = generateRecommendationReason(farm, userMessage);
                    return new ChatResponse.FarmSuggestion(
                            farm.getId(),
                            farm.getName(),
                            farm.getLocation(),
                            farm.getImageUrl(),
                            ratingInfo[0] > 0 ? ratingInfo[0] : null,
                            ratingInfo[1] > 0 ? (int) ratingInfo[1] : null,
                            reason);
                })
                .collect(Collectors.toList());
    }

    private boolean isSearchRelatedMessage(String message) {
        String lower = message.toLowerCase();
        // Keywords indicating farm search intent
        return lower.contains("農園") || lower.contains("狩り") || lower.contains("収穫") ||
                lower.contains("体験") || lower.contains("おすすめ") || lower.contains("探し") ||
                lower.contains("いちご") || lower.contains("りんご") || lower.contains("ぶどう") ||
                lower.contains("みかん") || lower.contains("さくらんぼ") || lower.contains("野菜") ||
                lower.contains("子連れ") || lower.contains("家族") || lower.contains("デート") ||
                containsLocationKeyword(lower);
    }

    private boolean containsLocationKeyword(String message) {
        String[] locations = { "東京", "神奈川", "千葉", "埼玉", "長野", "山梨", "静岡", "群馬", "栃木", "茨城" };
        for (String loc : locations) {
            if (message.contains(loc))
                return true;
        }
        return false;
    }

    private SearchCriteria extractSearchCriteria(String userMessage) {
        SearchCriteria criteria = new SearchCriteria();

        try {
            if (geminiClient != null) {
                String prompt = String.format(CRITERIA_EXTRACTION_PROMPT, userMessage);
                GenerateContentResponse response = geminiClient.models.generateContent(
                        geminiConfig.getModel(), prompt, null);
                String jsonResponse = response.text();

                // Parse JSON response (simple parsing)
                criteria.crop = extractJsonValue(jsonResponse, "crop");
                criteria.location = extractJsonValue(jsonResponse, "location");
                criteria.familyFriendly = jsonResponse.contains("\"familyFriendly\": true");
            }
        } catch (Exception e) {
            // Fallback to keyword-based extraction
            criteria = extractCriteriaFromKeywords(userMessage);
        }

        return criteria;
    }

    private String extractJsonValue(String json, String key) {
        Pattern pattern = Pattern.compile("\"" + key + "\"\\s*:\\s*\"([^\"]+)\"");
        Matcher matcher = pattern.matcher(json);
        return matcher.find() ? matcher.group(1) : null;
    }

    private SearchCriteria extractCriteriaFromKeywords(String message) {
        SearchCriteria criteria = new SearchCriteria();
        String lower = message.toLowerCase();

        // Extract crop
        if (lower.contains("いちご"))
            criteria.crop = "いちご";
        else if (lower.contains("りんご"))
            criteria.crop = "りんご";
        else if (lower.contains("ぶどう"))
            criteria.crop = "ぶどう";
        else if (lower.contains("みかん"))
            criteria.crop = "みかん";
        else if (lower.contains("さくらんぼ"))
            criteria.crop = "さくらんぼ";
        else if (lower.contains("野菜"))
            criteria.crop = "野菜";

        // Extract location
        String[] locations = { "東京", "神奈川", "千葉", "埼玉", "長野", "山梨", "静岡" };
        for (String loc : locations) {
            if (lower.contains(loc.toLowerCase())) {
                criteria.location = loc;
                break;
            }
        }

        // Family friendly
        criteria.familyFriendly = lower.contains("子連れ") || lower.contains("家族") || lower.contains("子ども");

        return criteria;
    }

    private List<Farm> filterFarms(List<Farm> farms, SearchCriteria criteria, String originalMessage) {
        String lowerMessage = originalMessage.toLowerCase();

        return farms.stream()
                .filter(farm -> {
                    String featuresStr = farm.getFeatures() != null ? String.join(" ", farm.getFeatures()) : "";
                    String farmInfo = (farm.getName() + " " + farm.getLocation() + " " +
                            (farm.getDescription() != null ? farm.getDescription() : "") + " " +
                            featuresStr).toLowerCase();

                    // Match by crop
                    if (criteria.crop != null && !farmInfo.contains(criteria.crop.toLowerCase())) {
                        return false;
                    }

                    // Match by location
                    if (criteria.location != null && !farmInfo.contains(criteria.location.toLowerCase())) {
                        return false;
                    }

                    // Match by familyFriendly
                    if (criteria.familyFriendly) {
                        boolean isFamilyFriendly = farmInfo.contains("子連れ") ||
                                farmInfo.contains("家族") ||
                                farmInfo.contains("子供") ||
                                farmInfo.contains("キッズ");
                        if (!isFamilyFriendly) {
                            return false;
                        }
                    }

                    // If no criteria extracted, use keyword matching
                    if (criteria.crop == null && criteria.location == null && !criteria.familyFriendly) {
                        // Check if any keyword from message matches farm info
                        String[] keywords = lowerMessage.split("[\\s、。]+");
                        for (String keyword : keywords) {
                            if (keyword.length() >= 2 && farmInfo.contains(keyword)) {
                                return true;
                            }
                        }
                        // Include all farms if no specific keywords
                        return true;
                    }

                    return true;
                })
                .collect(Collectors.toList());
    }

    private Map<Long, double[]> getRatingsMap(List<Long> farmIds) {
        if (farmIds.isEmpty()) {
            return Map.of();
        }
        List<Object[]> results = reviewRepository.getAverageRatingsForFarms(farmIds);
        return results.stream()
                .collect(Collectors.toMap(
                        r -> (Long) r[0],
                        r -> new double[] { (Double) r[1], ((Long) r[2]).doubleValue() }));
    }

    private String generateRecommendationReason(Farm farm, String userMessage) {
        try {
            if (geminiClient != null) {
                String prompt = String.format(REASON_GENERATION_PROMPT,
                        farm.getName(),
                        farm.getDescription() != null
                                ? farm.getDescription().substring(0, Math.min(200, farm.getDescription().length()))
                                : "",
                        userMessage);
                GenerateContentResponse response = geminiClient.models.generateContent(
                        geminiConfig.getModel(), prompt, null);
                String reason = response.text();
                // Trim and clean up
                return reason.trim().replaceAll("\\n+", " ");
            }
        } catch (Exception e) {
            // Fallback reason
        }
        return farm.getLocation() + "で人気の農園です";
    }

    // Inner class for search criteria
    private static class SearchCriteria {
        String crop;
        String location;
        boolean familyFriendly;
    }
}
