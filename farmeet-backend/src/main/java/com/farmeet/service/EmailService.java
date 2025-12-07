package com.farmeet.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender emailSender;

    public void sendOtp(String email, String otp) {
        // Log to console for debugging/fallback
        System.out.println("==================================================");
        System.out.println("Sending OTP to " + email);
        System.out.println("OTP Code: " + otp);
        System.out.println("==================================================");

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("FarMeet 認証コード");
            message.setText("あなたの認証コードは: " + otp + " です。\n10分間有効です。");
            emailSender.send(message);
        } catch (Exception e) {
            System.err.println("メール送信に失敗しました: " + e.getMessage());
            // Don't throw exception to avoid breaking the flow if SMTP is not configured
        }
    }
}
