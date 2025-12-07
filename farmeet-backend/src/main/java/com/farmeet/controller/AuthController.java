package com.farmeet.controller;

import com.farmeet.dto.AuthRequest;
import com.farmeet.dto.AuthResponse;
import com.farmeet.dto.SignupRequest;
import com.farmeet.entity.User;
import com.farmeet.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@RequestBody SignupRequest request) {
        try {
            AuthResponse response = authService.signup(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<User> getProfile(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(user);
    }

    @PutMapping("/profile")
    public ResponseEntity<User> updateProfile(@AuthenticationPrincipal User user,
            @RequestBody User updatedUser) {
        try {
            User updated = authService.updateProfile(user, updatedUser);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/check-email")
    public ResponseEntity<java.util.Map<String, Object>> checkEmail(@RequestParam String email) {
        boolean exists = authService.checkEmail(email);
        boolean isAdmin = false;
        if (exists) {
            User user = authService.getCurrentUser(email);
            isAdmin = user.getRole() == User.Role.ADMIN;
        }
        return ResponseEntity.ok(java.util.Map.of("exists", exists, "isAdmin", isAdmin));
    }

    @PostMapping("/send-otp")
    public ResponseEntity<Void> sendOtp(@RequestBody java.util.Map<String, String> payload) {
        authService.generateOtp(payload.get("email"));
        return ResponseEntity.ok().build();
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody java.util.Map<String, String> payload) {
        try {
            boolean isSignup = Boolean.parseBoolean(payload.getOrDefault("isSignup", "false"));
            if (isSignup) {
                boolean valid = authService.verifyOtpForSignup(payload.get("email"), payload.get("code"));
                return ResponseEntity.ok(java.util.Map.of("valid", valid));
            } else {
                AuthResponse response = authService.verifyOtp(payload.get("email"), payload.get("code"));
                return ResponseEntity.ok(response);
            }
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage()));
        }
    }
}
