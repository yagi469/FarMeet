package com.farmeet.dto;

import com.farmeet.entity.Payment;
import com.farmeet.entity.PaymentMethod;
import com.farmeet.entity.PaymentStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PaymentDto {
    private Long id;
    private Long reservationId;
    private PaymentMethod paymentMethod;
    private PaymentStatus paymentStatus;
    private BigDecimal amount;
    private BigDecimal refundedAmount;
    private LocalDateTime transferDeadline;
    private LocalDateTime paidAt;
    private LocalDateTime refundedAt;
    private LocalDateTime createdAt;

    public static PaymentDto fromEntity(Payment payment) {
        PaymentDto dto = new PaymentDto();
        dto.setId(payment.getId());
        dto.setReservationId(payment.getReservation().getId());
        dto.setPaymentMethod(payment.getPaymentMethod());
        dto.setPaymentStatus(payment.getPaymentStatus());
        dto.setAmount(payment.getAmount());
        dto.setRefundedAmount(payment.getRefundedAmount());
        dto.setTransferDeadline(payment.getTransferDeadline());
        dto.setPaidAt(payment.getPaidAt());
        dto.setRefundedAt(payment.getRefundedAt());
        dto.setCreatedAt(payment.getCreatedAt());
        return dto;
    }
}
