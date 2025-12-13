package com.farmeet.service;

import com.farmeet.dto.GiftVoucherDto;
import com.farmeet.entity.*;
import com.farmeet.repository.GiftVoucherRepository;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class GiftVoucherService {

    private final GiftVoucherRepository giftVoucherRepository;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    @Value("${stripe.secret-key:}")
    private String stripeSecretKey;

    private static final String CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final int CODE_LENGTH = 16;
    private static final SecureRandom random = new SecureRandom();

    public GiftVoucherService(GiftVoucherRepository giftVoucherRepository) {
        this.giftVoucherRepository = giftVoucherRepository;
    }

    /**
     * ギフト券コードを生成
     */
    private String generateCode() {
        StringBuilder code = new StringBuilder(CODE_LENGTH);
        for (int i = 0; i < CODE_LENGTH; i++) {
            code.append(CODE_CHARS.charAt(random.nextInt(CODE_CHARS.length())));
        }
        return code.toString();
    }

    /**
     * ギフト券購入処理を開始
     */
    @Transactional
    public GiftVoucherDto.PurchaseResponse purchaseGiftVoucher(
            GiftVoucherDto.PurchaseRequest request,
            User purchaser) throws StripeException {

        // ギフト券を作成（PENDING状態）
        GiftVoucher voucher = new GiftVoucher();
        voucher.setAmount(request.getAmount());
        voucher.setBalance(request.getAmount());
        voucher.setStatus(GiftVoucherStatus.PENDING);
        voucher.setPurchaser(purchaser);
        voucher.setRecipientName(request.getRecipientName());
        voucher.setRecipientEmail(request.getRecipientEmail());
        voucher.setMessage(request.getMessage());
        voucher.setExpiresAt(LocalDateTime.now().plusYears(1));

        // 決済方法を設定
        PaymentMethod paymentMethod = PaymentMethod.valueOf(request.getPaymentMethod());
        voucher.setPaymentMethod(paymentMethod);

        voucher = giftVoucherRepository.save(voucher);

        // Stripe決済の場合
        if (paymentMethod == PaymentMethod.STRIPE) {
            String checkoutUrl = createStripeCheckoutSession(voucher);
            return GiftVoucherDto.PurchaseResponse.builder()
                    .success(true)
                    .voucherId(voucher.getId())
                    .paymentUrl(checkoutUrl)
                    .build();
        }

        // PayPay決済の場合
        if (paymentMethod == PaymentMethod.PAYPAY) {
            String paymentUrl = createPayPayPaymentLink(voucher);
            return GiftVoucherDto.PurchaseResponse.builder()
                    .success(true)
                    .voucherId(voucher.getId())
                    .paymentUrl(paymentUrl)
                    .build();
        }

        throw new RuntimeException("サポートされていない決済方法です: " + paymentMethod);
    }

    /**
     * Stripe Checkout Sessionを作成
     */
    private String createStripeCheckoutSession(GiftVoucher voucher) throws StripeException {
        if (stripeSecretKey == null || stripeSecretKey.isEmpty()) {
            throw new RuntimeException("Stripe is not configured. Please set stripe.secret-key");
        }

        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(frontendUrl + "/gift-vouchers/success?voucher_id=" + voucher.getId())
                .setCancelUrl(frontendUrl + "/gift-vouchers/cancel?voucher_id=" + voucher.getId())
                .addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setQuantity(1L)
                                .setPriceData(
                                        SessionCreateParams.LineItem.PriceData.builder()
                                                .setCurrency("jpy")
                                                .setUnitAmount(voucher.getAmount().longValue())
                                                .setProductData(
                                                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                .setName("FarMeet ギフト券")
                                                                .setDescription("額面: " + voucher.getAmount() + "円")
                                                                .build())
                                                .build())
                                .build())
                .putMetadata("voucher_id", voucher.getId().toString())
                .putMetadata("type", "gift_voucher")
                .setLocale(SessionCreateParams.Locale.JA)
                .build();

        Session session = Session.create(params);

        voucher.setStripeCheckoutSessionId(session.getId());
        giftVoucherRepository.save(voucher);

        return session.getUrl();
    }

    /**
     * PayPay決済リンクを作成（モック実装）
     * 本番環境では PayPay Developer API を使用
     */
    private String createPayPayPaymentLink(GiftVoucher voucher) {
        // PayPay Payment IDを生成（モック）
        String paypayPaymentId = "PAYPAY_GIFT_" + UUID.randomUUID().toString();
        voucher.setPaypayPaymentId(paypayPaymentId);
        giftVoucherRepository.save(voucher);

        // モック実装では成功ページへのリダイレクトURLを返す
        return frontendUrl + "/gift-vouchers/paypay/mock?voucher_id=" + voucher.getId() +
                "&amount=" + voucher.getAmount().longValue();
    }

    /**
     * PayPay決済完了を処理
     */
    @Transactional
    public GiftVoucher handlePayPayPaymentComplete(Long voucherId) {
        GiftVoucher voucher = giftVoucherRepository.findById(voucherId)
                .orElseThrow(() -> new RuntimeException("ギフト券が見つかりません"));

        if (voucher.getStatus() != GiftVoucherStatus.PENDING) {
            throw new RuntimeException("このギフト券は既に処理されています");
        }

        // コードを生成して有効化
        String code;
        do {
            code = generateCode();
        } while (giftVoucherRepository.findByCode(code).isPresent());

        voucher.setCode(code);
        voucher.setStatus(GiftVoucherStatus.ACTIVE);
        voucher.setActivatedAt(LocalDateTime.now());
        giftVoucherRepository.save(voucher);

        return voucher;
    }

    /**
     * ギフト券を有効化（決済完了後）
     */
    @Transactional
    public GiftVoucherDto.ActivateResponse activateGiftVoucher(Long voucherId) {
        GiftVoucher voucher = giftVoucherRepository.findById(voucherId)
                .orElseThrow(() -> new RuntimeException("ギフト券が見つかりません"));

        if (voucher.getStatus() != GiftVoucherStatus.PENDING) {
            throw new RuntimeException("このギフト券は既に有効化されています");
        }

        // コードを生成
        String code;
        do {
            code = generateCode();
        } while (giftVoucherRepository.findByCode(code).isPresent());

        voucher.setCode(code);
        voucher.setStatus(GiftVoucherStatus.ACTIVE);
        voucher.setActivatedAt(LocalDateTime.now());
        giftVoucherRepository.save(voucher);

        return GiftVoucherDto.ActivateResponse.builder()
                .success(true)
                .code(code)
                .amount(voucher.getAmount())
                .expiresAt(voucher.getExpiresAt())
                .build();
    }

    /**
     * Stripe Checkout完了を処理
     */
    @Transactional
    public GiftVoucher handleStripeCheckoutComplete(String sessionId) throws StripeException {
        Session session = Session.retrieve(sessionId);

        GiftVoucher voucher = giftVoucherRepository.findByStripeCheckoutSessionId(sessionId)
                .orElseThrow(() -> new RuntimeException("ギフト券が見つかりません: " + sessionId));

        if ("complete".equals(session.getStatus()) && "paid".equals(session.getPaymentStatus())) {
            voucher.setStripePaymentIntentId(session.getPaymentIntent());

            // コードを生成して有効化
            String code;
            do {
                code = generateCode();
            } while (giftVoucherRepository.findByCode(code).isPresent());

            voucher.setCode(code);
            voucher.setStatus(GiftVoucherStatus.ACTIVE);
            voucher.setActivatedAt(LocalDateTime.now());
            giftVoucherRepository.save(voucher);
        }

        return voucher;
    }

    /**
     * ギフト券コードを確認
     */
    public GiftVoucherDto.CheckResponse checkGiftVoucher(String code) {
        GiftVoucher voucher = giftVoucherRepository.findByCode(code.toUpperCase())
                .orElseThrow(() -> new RuntimeException("ギフト券が見つかりません"));

        return GiftVoucherDto.CheckResponse.builder()
                .id(voucher.getId())
                .code(voucher.getCode())
                .amount(voucher.getAmount())
                .balance(voucher.getBalance())
                .status(voucher.getStatus().name())
                .expiresAt(voucher.getExpiresAt())
                .purchaserName(voucher.getPurchaser() != null ? voucher.getPurchaser().getUsername() : null)
                .hasMessage(voucher.getMessage() != null && !voucher.getMessage().isEmpty())
                .isUsable(voucher.isUsable())
                .build();
    }

    /**
     * ギフト券をユーザーに登録
     */
    @Transactional
    public GiftVoucherDto.RedeemResponse redeemGiftVoucher(String code, User user) {
        GiftVoucher voucher = giftVoucherRepository.findByCode(code.toUpperCase())
                .orElseThrow(() -> new RuntimeException("ギフト券が見つかりません"));

        if (voucher.getStatus() == GiftVoucherStatus.PENDING) {
            throw new RuntimeException("このギフト券はまだ有効化されていません");
        }

        if (voucher.getStatus() == GiftVoucherStatus.USED) {
            throw new RuntimeException("このギフト券は既に使用済みです");
        }

        if (voucher.getStatus() == GiftVoucherStatus.EXPIRED) {
            throw new RuntimeException("このギフト券は有効期限が切れています");
        }

        if (voucher.getStatus() == GiftVoucherStatus.CANCELLED) {
            throw new RuntimeException("このギフト券はキャンセルされています");
        }

        if (voucher.getOwner() != null) {
            if (voucher.getOwner().getId().equals(user.getId())) {
                throw new RuntimeException("このギフト券は既に登録済みです");
            }
            throw new RuntimeException("このギフト券は既に他のユーザーに登録されています");
        }

        voucher.setOwner(user);
        voucher.setStatus(GiftVoucherStatus.REDEEMED);
        voucher.setRedeemedAt(LocalDateTime.now());
        giftVoucherRepository.save(voucher);

        return GiftVoucherDto.RedeemResponse.builder()
                .success(true)
                .message("ギフト券を登録しました")
                .balance(voucher.getBalance())
                .build();
    }

    /**
     * ユーザーのギフト券一覧を取得
     */
    public List<GiftVoucherDto> getMyVouchers(User user) {
        return giftVoucherRepository.findByOwnerOrderByCreatedAtDesc(user)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /**
     * ユーザーの使用可能なギフト券一覧を取得
     */
    public List<GiftVoucherDto.UsableVoucher> getUsableVouchers(User user) {
        return giftVoucherRepository.findUsableByOwner(
                user, BigDecimal.ZERO, LocalDateTime.now())
                .stream()
                .map(v -> GiftVoucherDto.UsableVoucher.builder()
                        .id(v.getId())
                        .code(v.getCode())
                        .amount(v.getAmount())
                        .balance(v.getBalance())
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * ギフト券を使用（残高から差し引き）
     */
    @Transactional
    public BigDecimal useVoucher(Long voucherId, BigDecimal amount, User user) {
        GiftVoucher voucher = giftVoucherRepository.findById(voucherId)
                .orElseThrow(() -> new RuntimeException("ギフト券が見つかりません"));

        if (!voucher.getOwner().getId().equals(user.getId())) {
            throw new RuntimeException("このギフト券は使用できません");
        }

        if (!voucher.isUsable()) {
            throw new RuntimeException("このギフト券は使用できません");
        }

        BigDecimal actualUsage = amount.min(voucher.getBalance());
        voucher.setBalance(voucher.getBalance().subtract(actualUsage));

        if (voucher.getBalance().compareTo(BigDecimal.ZERO) == 0) {
            voucher.setStatus(GiftVoucherStatus.USED);
        }

        giftVoucherRepository.save(voucher);

        return actualUsage;
    }

    /**
     * EntityからDTOに変換
     */
    private GiftVoucherDto toDto(GiftVoucher voucher) {
        return GiftVoucherDto.builder()
                .id(voucher.getId())
                .code(voucher.getCode())
                .amount(voucher.getAmount())
                .balance(voucher.getBalance())
                .status(voucher.getStatus().name())
                .expiresAt(voucher.getExpiresAt())
                .createdAt(voucher.getCreatedAt())
                .isUsable(voucher.isUsable())
                .purchaserName(voucher.getPurchaser() != null ? voucher.getPurchaser().getUsername() : null)
                .recipientName(voucher.getRecipientName())
                .recipientEmail(voucher.getRecipientEmail())
                .hasMessage(voucher.getMessage() != null && !voucher.getMessage().isEmpty())
                .build();
    }
}
