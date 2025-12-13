package com.farmeet.repository;

import com.farmeet.entity.GiftVoucher;
import com.farmeet.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface GiftVoucherRepository extends JpaRepository<GiftVoucher, Long> {

        /**
         * コードでギフト券を検索
         */
        Optional<GiftVoucher> findByCode(String code);

        /**
         * 所有者のギフト券一覧を取得
         */
        List<GiftVoucher> findByOwnerOrderByCreatedAtDesc(User owner);

        /**
         * 所有者の使用可能なギフト券を取得（残高がある && 有効期限内）
         */
        @Query("SELECT g FROM GiftVoucher g WHERE g.owner = :owner " +
                        "AND g.balance > :zero " +
                        "AND (g.status = 'ACTIVE' OR g.status = 'REDEEMED') " +
                        "AND (g.expiresAt IS NULL OR g.expiresAt > :now)")
        List<GiftVoucher> findUsableByOwner(
                        @Param("owner") User owner,
                        @Param("zero") BigDecimal zero,
                        @Param("now") LocalDateTime now);

        /**
         * 購入者のギフト券一覧を取得
         */
        List<GiftVoucher> findByPurchaserOrderByCreatedAtDesc(User purchaser);

        /**
         * Stripe Checkout Session IDで検索
         */
        Optional<GiftVoucher> findByStripeCheckoutSessionId(String sessionId);

        /**
         * 期限切れのギフト券を一括更新するためのクエリ用
         */
        @Query("SELECT g FROM GiftVoucher g WHERE g.status IN ('ACTIVE', 'REDEEMED') " +
                        "AND g.expiresAt IS NOT NULL AND g.expiresAt < :now")
        List<GiftVoucher> findExpiredVouchers(@Param("now") LocalDateTime now);
}
