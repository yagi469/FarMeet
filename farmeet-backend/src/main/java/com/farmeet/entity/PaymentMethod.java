package com.farmeet.entity;

/**
 * 決済方法を表すEnum
 */
public enum PaymentMethod {
    /** クレジットカード決済 (Stripe) */
    STRIPE,

    /** PayPay決済 */
    PAYPAY,

    /** 銀行振込 */
    BANK_TRANSFER
}
