package com.farmeet.service;

import org.springframework.stereotype.Service;

@Service
public class SmsService {

    @org.springframework.beans.factory.annotation.Value("${twilio.account.sid:}")
    private String accountSid;

    @org.springframework.beans.factory.annotation.Value("${twilio.auth.token:}")
    private String authToken;

    @org.springframework.beans.factory.annotation.Value("${twilio.phone.number:}")
    private String twilioPhoneNumber;

    public void sendOtp(String phoneNumber, String otp) {
        // Log to console for debugging/fallback
        System.out.println("==================================================");
        System.out.println("Sending SMS OTP to " + phoneNumber);
        System.out.println("OTP Code: " + otp);
        System.out.println("==================================================");

        if (accountSid != null && !accountSid.isEmpty() &&
                authToken != null && !authToken.isEmpty() &&
                twilioPhoneNumber != null && !twilioPhoneNumber.isEmpty()) {

            try {
                com.twilio.Twilio.init(accountSid, authToken);
                com.twilio.rest.api.v2010.account.Message.creator(
                        new com.twilio.type.PhoneNumber(phoneNumber),
                        new com.twilio.type.PhoneNumber(twilioPhoneNumber),
                        "Your FarMeet verification code is: " + otp)
                        .create();
                System.out.println("SMS sent via Twilio to " + phoneNumber);
            } catch (Exception e) {
                System.err.println("Failed to send SMS via Twilio: " + e.getMessage());
                // Don't throw exception to avoid breaking the flow if SMS fails in dev/test
                // In prod you might want to handle this differently
            }
        } else {
            System.out.println("Twilio credentials not configured. Skipping SMS sending.");
        }
    }
}
