package com.farmeet.controller;

import com.farmeet.dto.PaymentDto;
import com.farmeet.entity.Payment;
import com.farmeet.entity.Reservation;
import com.farmeet.entity.User;
import com.farmeet.repository.ReservationRepository;
import com.farmeet.service.PaymentService;
import com.stripe.exception.StripeException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;
    private final ReservationRepository reservationRepository;

    public PaymentController(PaymentService paymentService,
            ReservationRepository reservationRepository) {
        this.paymentService = paymentService;
        this.reservationRepository = reservationRepository;
    }

    /**
     * 予約の決済情報を取得
     */
    @GetMapping("/reservation/{reservationId}")
    public ResponseEntity<PaymentDto> getPaymentByReservation(
            @PathVariable Long reservationId,
            @AuthenticationPrincipal User user) {
        Payment payment = paymentService.getPaymentByReservationId(reservationId);
        if (payment == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(PaymentDto.fromEntity(payment));
    }

    /**
     * 利用可能な決済方法を取得
     */
    @GetMapping("/methods")
    public ResponseEntity<Map<String, Object>> getPaymentMethods() {
        Map<String, Object> methods = new HashMap<>();
        methods.put("stripe", Map.of("enabled", true, "name", "クレジットカード"));
        methods.put("paypay", Map.of("enabled", true, "name", "PayPay"));
        methods.put("bankTransfer", Map.of("enabled", true, "name", "銀行振込"));
        return ResponseEntity.ok(methods);
    }

    /**
     * Stripe決済を開始（ギフト券適用対応）
     */
    @PostMapping("/stripe/create-checkout-session")
    public ResponseEntity<Map<String, Object>> createStripeCheckoutSession(
            @RequestBody Map<String, Object> request,
            @AuthenticationPrincipal User user) {
        try {
            Long reservationId = ((Number) request.get("reservationId")).longValue();
            Long voucherId = request.get("voucherId") != null
                    ? ((Number) request.get("voucherId")).longValue()
                    : null;

            validateReservationOwner(reservationId, user);

            String checkoutUrl = paymentService.initiateStripePayment(reservationId, voucherId);

            if (checkoutUrl == null) {
                // ギフト券で全額支払い完了
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "paidWithVoucher", true,
                        "message", "ギフト券で決済が完了しました"));
            }

            return ResponseEntity.ok(Map.of("url", checkoutUrl));
        } catch (StripeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * PayPay決済を開始（ギフト券適用対応）
     */
    @PostMapping("/paypay/create-payment")
    public ResponseEntity<Map<String, Object>> createPayPayPayment(
            @RequestBody Map<String, Object> request,
            @AuthenticationPrincipal User user) {
        try {
            Long reservationId = ((Number) request.get("reservationId")).longValue();
            Long voucherId = request.get("voucherId") != null
                    ? ((Number) request.get("voucherId")).longValue()
                    : null;

            validateReservationOwner(reservationId, user);

            String paymentUrl = paymentService.initiatePayPayPayment(reservationId, voucherId);

            if (paymentUrl == null) {
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "paidWithVoucher", true,
                        "message", "ギフト券で決済が完了しました"));
            }

            return ResponseEntity.ok(Map.of("url", paymentUrl));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 銀行振込を開始（ギフト券適用対応）
     */
    @PostMapping("/bank-transfer/initiate")
    public ResponseEntity<?> initiateBankTransfer(
            @RequestBody Map<String, Object> request,
            @AuthenticationPrincipal User user) {
        try {
            Long reservationId = ((Number) request.get("reservationId")).longValue();
            Long voucherId = request.get("voucherId") != null
                    ? ((Number) request.get("voucherId")).longValue()
                    : null;

            validateReservationOwner(reservationId, user);

            Payment payment = paymentService.initiateBankTransfer(reservationId, voucherId);

            // ギフト券で全額支払い済みの場合
            if (payment.getAmount().compareTo(java.math.BigDecimal.ZERO) == 0) {
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "paidWithVoucher", true,
                        "message", "ギフト券で決済が完了しました"));
            }

            return ResponseEntity.ok(PaymentDto.fromEntity(payment));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 銀行振込の入金確認（管理者用）
     */
    @PostMapping("/bank-transfer/{paymentId}/confirm")
    public ResponseEntity<PaymentDto> confirmBankTransfer(
            @PathVariable Long paymentId) {
        try {
            Payment payment = paymentService.confirmBankTransfer(paymentId);
            return ResponseEntity.ok(PaymentDto.fromEntity(payment));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Stripe Webhook受信
     */
    @PostMapping("/webhook/stripe")
    public ResponseEntity<String> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {
        try {
            // Webhook処理（実際の実装ではStripeのWebhook署名検証が必要）
            // 簡易実装のため、checkout.session.completedイベントを処理
            return ResponseEntity.ok("Received");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Stripe決済成功のコールバック
     */
    @GetMapping("/stripe/success")
    public ResponseEntity<Map<String, Object>> handleStripeSuccess(
            @RequestParam("session_id") String sessionId) {
        try {
            paymentService.handleStripeCheckoutComplete(sessionId);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (StripeException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    /**
     * PayPay決済完了のコールバック（モック用）
     */
    @PostMapping("/paypay/complete")
    public ResponseEntity<Map<String, Object>> handlePayPayComplete(
            @RequestBody Map<String, Long> request) {
        try {
            Long paymentId = request.get("paymentId");
            Payment payment = paymentService.completePayPayPayment(paymentId);
            return ResponseEntity.ok(Map.of("success", true, "reservationId", payment.getReservation().getId()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    /**
     * 返金処理
     */
    @PostMapping("/{reservationId}/refund")
    public ResponseEntity<Map<String, Object>> refundPayment(
            @PathVariable Long reservationId,
            @AuthenticationPrincipal User user) {
        try {
            validateReservationOwner(reservationId, user);
            Payment payment = paymentService.processRefund(reservationId);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "refundedAmount", payment.getRefundedAmount(),
                    "status", payment.getPaymentStatus()));
        } catch (StripeException | RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    /**
     * 返金率を取得
     */
    @GetMapping("/{reservationId}/refund-rate")
    public ResponseEntity<Map<String, Object>> getRefundRate(
            @PathVariable Long reservationId,
            @AuthenticationPrincipal User user) {
        try {
            Reservation reservation = reservationRepository.findById(reservationId)
                    .orElseThrow(() -> new RuntimeException("Reservation not found"));

            int refundPercentage = paymentService.getRefundPercentage(reservation);
            return ResponseEntity.ok(Map.of("refundPercentage", refundPercentage));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    private void validateReservationOwner(Long reservationId, User user) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));
        if (!reservation.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }
    }
}
