package com.farmeet.service;

import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
public class EmailService {

    @Value("${spring.sendgrid.api-key:}")
    private String sendGridApiKey;

    @Value("${mail.from-address:noreply@farmeet.com}")
    private String fromAddress;

    public void sendOtp(String email, String otp) {
        // Log to console for debugging/fallback
        System.out.println("==================================================");
        System.out.println("Sending OTP to " + email);
        System.out.println("OTP Code: " + otp);
        System.out.println("==================================================");

        if (sendGridApiKey == null || sendGridApiKey.isEmpty()) {
            System.out.println("SendGrid API Key is missing. Email will not be sent (Console Log Only).");
            return;
        }

        Email from = new Email(fromAddress, "FarMeet");
        String subject = "FarMeet 認証コード";
        Email to = new Email(email);
        Content content = new Content("text/plain", "あなたの認証コードは: " + otp + " です。\n10分間有効です。");
        Mail mail = new Mail(from, subject, to, content);

        SendGrid sg = new SendGrid(sendGridApiKey);
        Request request = new Request();
        try {
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());
            Response response = sg.api(request);
            System.out.println("SendGrid Status Code: " + response.getStatusCode());
            if (response.getStatusCode() >= 400) {
                System.err.println("SendGrid Error Body: " + response.getBody());
            }
        } catch (IOException ex) {
            System.err.println("メール送信に失敗しました (SendGrid): " + ex.getMessage());
        }
    }
}
