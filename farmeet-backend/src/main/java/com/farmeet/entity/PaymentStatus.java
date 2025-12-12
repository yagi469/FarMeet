package com.farmeet.entity;

/**
 * 決済ステータスを表すEnum
 */
public enum PaymentStatus {
    /** 決済待ち */
    PENDING,

    /** 決済完了 */
    COMPLETED,

    /** 決済失敗 */
    FAILED,

    /** 全額返金済み */
    REFUNDED,

    /** 一部返金済み */
    PARTIALLY_REFUNDED,

    /** キャンセル */
    CANCELLED
}
