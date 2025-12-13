package com.farmeet.controller;

import com.farmeet.dto.GiftVoucherDto;
import com.farmeet.entity.GiftVoucher;
import com.farmeet.entity.User;
import com.farmeet.service.GiftVoucherService;
import com.stripe.exception.StripeException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/gift-vouchers")
public class GiftVoucherController {

    private final GiftVoucherService giftVoucherService;

    public GiftVoucherController(GiftVoucherService giftVoucherService) {
        this.giftVoucherService = giftVoucherService;
    }

    /**
     * ギフト券を購入
     */
    @PostMapping("/purchase")
    public ResponseEntity<?> purchaseGiftVoucher(
            @RequestBody GiftVoucherDto.PurchaseRequest request,
            @AuthenticationPrincipal User user) {
        try {
            GiftVoucherDto.PurchaseResponse response = giftVoucherService.purchaseGiftVoucher(request, user);
            return ResponseEntity.ok(response);
        } catch (StripeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "決済処理に失敗しました: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 管理者による無料ギフト券発行
     */
    @PostMapping("/admin/issue")
    public ResponseEntity<?> issueGiftVoucherByAdmin(
            @RequestBody GiftVoucherDto.AdminIssueRequest request,
            @AuthenticationPrincipal User admin) {
        try {
            GiftVoucherDto.AdminIssueResponse response = giftVoucherService.issueGiftVoucherByAdmin(request, admin);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 管理者用: 全ギフト券一覧取得
     */
    @GetMapping("/admin/all")
    public ResponseEntity<?> getAllVouchersForAdmin(@AuthenticationPrincipal User admin) {
        try {
            if (!"ADMIN".equals(admin.getRole().name())) {
                return ResponseEntity.status(403).body(Map.of("error", "権限がありません"));
            }
            List<GiftVoucherDto> vouchers = giftVoucherService.getAllVouchers();
            return ResponseEntity.ok(vouchers);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * ギフト券を有効化（決済完了後）
     */
    @PostMapping("/activate/{voucherId}")
    public ResponseEntity<?> activateGiftVoucher(
            @PathVariable Long voucherId,
            @AuthenticationPrincipal User user) {
        try {
            GiftVoucherDto.ActivateResponse response = giftVoucherService.activateGiftVoucher(voucherId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Stripe Checkout完了時のコールバック
     */
    @GetMapping("/stripe/success")
    public ResponseEntity<?> handleStripeSuccess(@RequestParam("session_id") String sessionId) {
        try {
            GiftVoucher voucher = giftVoucherService.handleStripeCheckoutComplete(sessionId);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "voucherId", voucher.getId(),
                    "code", voucher.getCode(),
                    "amount", voucher.getAmount()));
        } catch (StripeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "決済確認に失敗しました: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * PayPay決済完了時のコールバック（モック用）
     */
    @PostMapping("/paypay/complete")
    public ResponseEntity<?> handlePayPayComplete(@RequestBody Map<String, Long> request) {
        try {
            Long voucherId = request.get("voucherId");
            GiftVoucher voucher = giftVoucherService.handlePayPayPaymentComplete(voucherId);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "voucherId", voucher.getId(),
                    "code", voucher.getCode(),
                    "amount", voucher.getAmount()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * ギフト券コードを確認
     */
    @GetMapping("/check/{code}")
    public ResponseEntity<?> checkGiftVoucher(@PathVariable String code) {
        try {
            GiftVoucherDto.CheckResponse response = giftVoucherService.checkGiftVoucher(code);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * ギフト券をユーザーに登録
     */
    @PostMapping("/redeem/{code}")
    public ResponseEntity<?> redeemGiftVoucher(
            @PathVariable String code,
            @AuthenticationPrincipal User user) {
        try {
            GiftVoucherDto.RedeemResponse response = giftVoucherService.redeemGiftVoucher(code, user);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * ユーザーのギフト券一覧を取得
     */
    @GetMapping("/my")
    public ResponseEntity<?> getMyVouchers(@AuthenticationPrincipal User user) {
        try {
            List<GiftVoucherDto> vouchers = giftVoucherService.getMyVouchers(user);
            return ResponseEntity.ok(vouchers);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * ユーザーの使用可能なギフト券一覧を取得
     */
    @GetMapping("/usable")
    public ResponseEntity<?> getUsableVouchers(@AuthenticationPrincipal User user) {
        try {
            List<GiftVoucherDto.UsableVoucher> vouchers = giftVoucherService.getUsableVouchers(user);
            return ResponseEntity.ok(vouchers);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
