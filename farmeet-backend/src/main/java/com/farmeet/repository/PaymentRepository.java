package com.farmeet.repository;

import com.farmeet.entity.Payment;
import com.farmeet.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByReservationId(Long reservationId);

    Optional<Payment> findByStripePaymentIntentId(String stripePaymentIntentId);

    Optional<Payment> findByStripeCheckoutSessionId(String stripeCheckoutSessionId);

    Optional<Payment> findByPaypayPaymentId(String paypayPaymentId);

    List<Payment> findByPaymentStatus(PaymentStatus status);

    /** 振込期限を過ぎた未決済の銀行振込を取得 */
    List<Payment> findByPaymentStatusAndTransferDeadlineBefore(
            PaymentStatus status, LocalDateTime deadline);
}
