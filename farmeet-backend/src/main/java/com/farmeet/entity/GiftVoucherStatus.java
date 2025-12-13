package com.farmeet.entity;

/**
 * ギフト券のステータス
 */
public enum GiftVoucherStatus {
    /** 購入手続き中（決済待ち） */
    PENDING,

    /** 有効（使用可能、未登録） */
    ACTIVE,

    /** 登録済み（ユーザーに紐付け済み） */
    REDEEMED,

    /** 使用済み（残高0） */
    USED,

    /** 有効期限切れ */
    EXPIRED,

    /** キャンセル済み */
    CANCELLED
}
