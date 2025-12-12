package com.farmeet.service;

import com.farmeet.entity.*;
import com.farmeet.repository.PaymentRepository;
import com.farmeet.repository.ReservationRepository;
import com.stripe.exception.StripeException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final ReservationRepository reservationRepository;
    private final StripeService stripeService;
    private final PayPayService payPayService;

    public PaymentService(PaymentRepository paymentRepository,
            ReservationRepository reservationRepository,
            StripeService stripeService,
            PayPayService payPayService) {
        this.paymentRepository = paymentRepository;
        this.reservationRepository = reservationRepository;
        this.stripeService = stripeService;
        this.payPayService = payPayService;
    }

    /**
     * 決済情報を作成
     */
    @Transactional
    public Payment createPayment(Reservation reservation, PaymentMethod paymentMethod) {
        Payment payment = new Payment();
        payment.setReservation(reservation);
        payment.setPaymentMethod(paymentMethod);
        payment.setPaymentStatus(PaymentStatus.PENDING);
        payment.setAmount(reservation.getTotalPrice());
        payment.setRefundedAmount(BigDecimal.ZERO);

        if (paymentMethod == PaymentMethod.BANK_TRANSFER) {
            // 振込期限: イベント日の3日前 または 7日後 の早い方
            LocalDateTime eventDate = reservation.getEvent().getEventDate();
            LocalDateTime sevenDaysLater = LocalDateTime.now().plusDays(7);
            LocalDateTime threeDaysBeforeEvent = eventDate.minusDays(3);

            LocalDateTime transferDeadline = sevenDaysLater.isBefore(threeDaysBeforeEvent)
                    ? sevenDaysLater
                    : threeDaysBeforeEvent;

            // 振込期限がすでに過ぎている場合は銀行振込不可
            if (transferDeadline.isBefore(LocalDateTime.now().plusDays(1))) {
                throw new RuntimeException("イベント開催日が近いため、銀行振込はご利用いただけません。クレジットカードまたはPayPayをご利用ください。");
            }

            payment.setTransferDeadline(transferDeadline);
        }

        return paymentRepository.save(payment);
    }

    /**
     * Stripe Checkout URLを取得
     */
    @Transactional
    public String initiateStripePayment(Long reservationId) throws StripeException {
        Reservation reservation = getReservationById(reservationId);

        Payment payment = paymentRepository.findByReservationId(reservationId)
                .orElseGet(() -> createPayment(reservation, PaymentMethod.STRIPE));

        return stripeService.createCheckoutSession(payment, reservation);
    }

    /**
     * PayPay決済URLを取得
     */
    @Transactional
    public String initiatePayPayPayment(Long reservationId) {
        Reservation reservation = getReservationById(reservationId);

        Payment payment = paymentRepository.findByReservationId(reservationId)
                .orElseGet(() -> createPayment(reservation, PaymentMethod.PAYPAY));

        return payPayService.createPaymentLink(payment, reservation);
    }

    /**
     * 銀行振込を開始
     */
    @Transactional
    public Payment initiateBankTransfer(Long reservationId) {
        Reservation reservation = getReservationById(reservationId);

        Payment payment = paymentRepository.findByReservationId(reservationId)
                .orElseGet(() -> createPayment(reservation, PaymentMethod.BANK_TRANSFER));

        reservation.setStatus(Reservation.ReservationStatus.AWAITING_TRANSFER);
        reservationRepository.save(reservation);

        return payment;
    }

    /**
     * 銀行振込の入金確認
     */
    @Transactional
    public Payment confirmBankTransfer(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        if (payment.getPaymentMethod() != PaymentMethod.BANK_TRANSFER) {
            throw new RuntimeException("This payment is not a bank transfer");
        }

        payment.setPaymentStatus(PaymentStatus.COMPLETED);
        payment.setPaidAt(LocalDateTime.now());
        paymentRepository.save(payment);

        // 予約を確定
        Reservation reservation = payment.getReservation();
        reservation.setStatus(Reservation.ReservationStatus.CONFIRMED);
        reservationRepository.save(reservation);

        return payment;
    }

    /**
     * 決済完了後の予約確定処理
     */
    @Transactional
    public void confirmReservationPayment(Long reservationId) {
        Reservation reservation = getReservationById(reservationId);
        reservation.setStatus(Reservation.ReservationStatus.CONFIRMED);
        reservationRepository.save(reservation);
    }

    /**
     * 返金処理（キャンセルポリシーに基づく）
     */
    @Transactional
    public Payment processRefund(Long reservationId) throws StripeException {
        Reservation reservation = getReservationById(reservationId);
        Payment payment = paymentRepository.findByReservationId(reservationId)
                .orElseThrow(() -> new RuntimeException("Payment not found for reservation"));

        if (payment.getPaymentStatus() != PaymentStatus.COMPLETED) {
            throw new RuntimeException("Cannot refund: payment is not completed");
        }

        // 返金額を計算
        BigDecimal refundAmount = calculateRefundAmount(reservation, payment);

        if (refundAmount.compareTo(BigDecimal.ZERO) <= 0) {
            // 返金なし
            payment.setPaymentStatus(PaymentStatus.COMPLETED);
            return paymentRepository.save(payment);
        }

        // 決済方法に応じて返金処理
        switch (payment.getPaymentMethod()) {
            case STRIPE:
                return stripeService.refund(payment, refundAmount);
            case PAYPAY:
                return payPayService.refund(payment, refundAmount);
            case BANK_TRANSFER:
                // 銀行振込の返金は手動対応
                payment.setRefundedAmount(refundAmount);
                payment.setRefundedAt(LocalDateTime.now());
                if (refundAmount.compareTo(payment.getAmount()) >= 0) {
                    payment.setPaymentStatus(PaymentStatus.REFUNDED);
                } else {
                    payment.setPaymentStatus(PaymentStatus.PARTIALLY_REFUNDED);
                }
                return paymentRepository.save(payment);
            default:
                throw new RuntimeException("Unknown payment method");
        }
    }

    /**
     * キャンセルポリシーに基づく返金額を計算
     * - 4日前まで: 100%
     * - 1〜3日前: 50%
     * - 当日: 0%
     */
    public BigDecimal calculateRefundAmount(Reservation reservation, Payment payment) {
        LocalDateTime eventDate = reservation.getEvent().getEventDate();
        LocalDateTime now = LocalDateTime.now();
        long daysUntilEvent = ChronoUnit.DAYS.between(now, eventDate);

        BigDecimal refundRate;
        if (daysUntilEvent >= 4) {
            refundRate = BigDecimal.ONE; // 100%
        } else if (daysUntilEvent >= 1) {
            refundRate = new BigDecimal("0.5"); // 50%
        } else {
            refundRate = BigDecimal.ZERO; // 0%
        }

        return payment.getAmount().multiply(refundRate).setScale(0, RoundingMode.DOWN);
    }

    /**
     * 返金率を取得（フロントエンド表示用）
     */
    public int getRefundPercentage(Reservation reservation) {
        LocalDateTime eventDate = reservation.getEvent().getEventDate();
        LocalDateTime now = LocalDateTime.now();
        long daysUntilEvent = ChronoUnit.DAYS.between(now, eventDate);

        if (daysUntilEvent >= 4) {
            return 100;
        } else if (daysUntilEvent >= 1) {
            return 50;
        } else {
            return 0;
        }
    }

    /**
     * 予約IDから決済情報を取得
     */
    public Payment getPaymentByReservationId(Long reservationId) {
        return paymentRepository.findByReservationId(reservationId)
                .orElse(null);
    }

    /**
     * StripeのCheckout Session完了を処理
     */
    @Transactional
    public void handleStripeCheckoutComplete(String sessionId) throws StripeException {
        Payment payment = stripeService.handleCheckoutSessionCompleted(sessionId);
        if (payment.getPaymentStatus() == PaymentStatus.COMPLETED) {
            confirmReservationPayment(payment.getReservation().getId());
        }
    }

    private Reservation getReservationById(Long reservationId) {
        return reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));
    }
}
