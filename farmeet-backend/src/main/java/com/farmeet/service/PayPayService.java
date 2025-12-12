package com.farmeet.service;

import com.farmeet.entity.Payment;
import com.farmeet.entity.PaymentStatus;
import com.farmeet.entity.Reservation;
import com.farmeet.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * PayPay API連携サービス
 * 注意: 本番環境ではPayPay Developer APIの正式な認証・連携が必要
 * 現在はモック実装
 */
@Service
public class PayPayService {

    @Value("${paypay.api-key:}")
    private String apiKey;

    @Value("${paypay.api-secret:}")
    private String apiSecret;

    @Value("${paypay.merchant-id:}")
    private String merchantId;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    private final PaymentRepository paymentRepository;

    public PayPayService(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    /**
     * PayPay決済リンクを作成（モック実装）
     * 本番環境では PayPay Developer API を使用
     */
    public String createPaymentLink(Payment payment, Reservation reservation) {
        // PayPay Payment IDを生成（モック）
        String paypayPaymentId = "PAYPAY_" + UUID.randomUUID().toString();
        payment.setPaypayPaymentId(paypayPaymentId);
        paymentRepository.save(payment);

        // 本番環境では PayPay API を呼び出して決済リンクを取得
        // モック実装では成功ページへのリダイレクトURLを返す
        return frontendUrl + "/payment/paypay/mock?payment_id=" + payment.getId() +
                "&amount=" + payment.getAmount().longValue();
    }

    /**
     * PayPay決済完了を処理（モック実装）
     */
    @Transactional
    public Payment handlePaymentCompleted(String paypayPaymentId) {
        Payment payment = paymentRepository.findByPaypayPaymentId(paypayPaymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found for PayPay ID: " + paypayPaymentId));

        payment.setPaymentStatus(PaymentStatus.COMPLETED);
        payment.setPaidAt(LocalDateTime.now());

        return paymentRepository.save(payment);
    }

    /**
     * 返金処理（モック実装）
     * 本番環境では PayPay Refund API を使用
     */
    @Transactional
    public Payment refund(Payment payment, BigDecimal refundAmount) {
        // 本番環境では PayPay Refund API を呼び出す

        BigDecimal totalRefunded = payment.getRefundedAmount().add(refundAmount);
        payment.setRefundedAmount(totalRefunded);
        payment.setRefundedAt(LocalDateTime.now());

        if (totalRefunded.compareTo(payment.getAmount()) >= 0) {
            payment.setPaymentStatus(PaymentStatus.REFUNDED);
        } else {
            payment.setPaymentStatus(PaymentStatus.PARTIALLY_REFUNDED);
        }

        return paymentRepository.save(payment);
    }

    /**
     * PayPayが設定されているかチェック
     */
    public boolean isConfigured() {
        return apiKey != null && !apiKey.isEmpty() &&
                apiSecret != null && !apiSecret.isEmpty();
    }
}
