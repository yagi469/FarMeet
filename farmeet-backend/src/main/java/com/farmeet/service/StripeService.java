package com.farmeet.service;

import com.farmeet.entity.Payment;
import com.farmeet.entity.PaymentStatus;
import com.farmeet.entity.Reservation;
import com.farmeet.repository.PaymentRepository;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.Refund;
import com.stripe.model.checkout.Session;
import com.stripe.param.RefundCreateParams;
import com.stripe.param.checkout.SessionCreateParams;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class StripeService {

    @Value("${stripe.secret-key:}")
    private String stripeSecretKey;

    @Value("${stripe.webhook-secret:}")
    private String webhookSecret;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    private final PaymentRepository paymentRepository;

    public StripeService(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    @PostConstruct
    public void init() {
        if (stripeSecretKey != null && !stripeSecretKey.isEmpty()) {
            Stripe.apiKey = stripeSecretKey;
        }
    }

    /**
     * Stripe Checkout Sessionを作成
     */
    public String createCheckoutSession(Payment payment, Reservation reservation) throws StripeException {
        if (stripeSecretKey == null || stripeSecretKey.isEmpty()) {
            throw new RuntimeException("Stripe is not configured. Please set stripe.secret-key");
        }

        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(frontendUrl + "/payment/stripe/success?session_id={CHECKOUT_SESSION_ID}")
                .setCancelUrl(frontendUrl + "/payment/stripe/cancel?reservation_id=" + reservation.getId())
                .addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setQuantity(1L)
                                .setPriceData(
                                        SessionCreateParams.LineItem.PriceData.builder()
                                                .setCurrency("jpy")
                                                .setUnitAmount(payment.getAmount().longValue())
                                                .setProductData(
                                                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                .setName(reservation.getEvent().getTitle())
                                                                .setDescription(
                                                                        reservation.getEvent().getFarm().getName()
                                                                                + " - " +
                                                                                reservation.getNumberOfPeople() + "名様")
                                                                .build())
                                                .build())
                                .build())
                .putMetadata("reservation_id", reservation.getId().toString())
                .putMetadata("payment_id", payment.getId().toString())
                .setLocale(SessionCreateParams.Locale.JA)
                .build();

        Session session = Session.create(params);

        // Checkout Session IDを保存
        payment.setStripeCheckoutSessionId(session.getId());
        paymentRepository.save(payment);

        return session.getUrl();
    }

    /**
     * Checkout Sessionから決済情報を取得し更新
     */
    @Transactional
    public Payment handleCheckoutSessionCompleted(String sessionId) throws StripeException {
        Session session = Session.retrieve(sessionId);

        Payment payment = paymentRepository.findByStripeCheckoutSessionId(sessionId)
                .orElseThrow(() -> new RuntimeException("Payment not found for session: " + sessionId));

        if ("complete".equals(session.getStatus()) && "paid".equals(session.getPaymentStatus())) {
            payment.setStripePaymentIntentId(session.getPaymentIntent());
            payment.setPaymentStatus(PaymentStatus.COMPLETED);
            payment.setPaidAt(LocalDateTime.now());
            paymentRepository.save(payment);
        }

        return payment;
    }

    /**
     * 返金処理
     */
    @Transactional
    public Payment refund(Payment payment, BigDecimal refundAmount) throws StripeException {
        if (payment.getStripePaymentIntentId() == null) {
            throw new RuntimeException("No Stripe payment intent ID found");
        }

        RefundCreateParams params = RefundCreateParams.builder()
                .setPaymentIntent(payment.getStripePaymentIntentId())
                .setAmount(refundAmount.longValue())
                .build();

        Refund.create(params);

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

    public String getWebhookSecret() {
        return webhookSecret;
    }
}
