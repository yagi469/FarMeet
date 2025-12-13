package com.farmeet.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * ギフト券のDTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GiftVoucherDto {
    private Long id;
    private String code;
    private BigDecimal amount;
    private BigDecimal balance;
    private String status;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
    private boolean isUsable;
    private String purchaserName;
    private String recipientName;
    private String recipientEmail;
    private boolean hasMessage;

    /**
     * 購入リクエスト
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PurchaseRequest {
        private BigDecimal amount;
        private String recipientName;
        private String recipientEmail;
        private String message;
        private String paymentMethod; // STRIPE or PAYPAY
    }

    /**
     * 購入レスポンス
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PurchaseResponse {
        private boolean success;
        private Long voucherId;
        private String paymentUrl;
    }

    /**
     * 有効化レスポンス
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ActivateResponse {
        private boolean success;
        private String code;
        private BigDecimal amount;
        private LocalDateTime expiresAt;
    }

    /**
     * 確認レスポンス
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CheckResponse {
        private Long id;
        private String code;
        private BigDecimal amount;
        private BigDecimal balance;
        private String status;
        private LocalDateTime expiresAt;
        private String purchaserName;
        private boolean hasMessage;
        private boolean isUsable;
    }

    /**
     * 登録レスポンス
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RedeemResponse {
        private boolean success;
        private String message;
        private BigDecimal balance;
    }

    /**
     * 使用可能ギフト券（予約時用）
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UsableVoucher {
        private Long id;
        private String code;
        private BigDecimal amount;
        private BigDecimal balance;
    }
}
