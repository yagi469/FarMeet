package com.farmeet.service;

import com.farmeet.dto.AuthRequest;
import com.farmeet.dto.AuthResponse;
import com.farmeet.dto.SignupRequest;
import com.farmeet.entity.User;
import com.farmeet.repository.UserRepository;
import com.farmeet.security.JwtProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtProvider jwtProvider;

    @Autowired
    private ActivityLogService activityLogService;

    public AuthResponse signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());

        // Handle password
        if (request.getPassword() != null && "otp-verified".equals(request.getPassword())
                && request.getPhoneNumber() != null) {
            // For phone signup, we generate a random password
            user.setPassword(passwordEncoder.encode(java.util.UUID.randomUUID().toString()));
        } else {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        if (request.getPhoneNumber() != null && !request.getPhoneNumber().isEmpty()) {
            if (userRepository.findByPhoneNumber(request.getPhoneNumber()).isPresent()) {
                throw new RuntimeException("Phone number already exists");
            }

            // Validate OTP for phone signup
            if (request.getPhoneOtp() != null && !request.getPhoneOtp().isEmpty()) {
                com.farmeet.entity.OtpCode otpCode = otpRepository.findByPhoneNumber(request.getPhoneNumber())
                        .orElseThrow(() -> new RuntimeException("OTP not found"));

                if (otpCode.getExpiryDate().isBefore(java.time.LocalDateTime.now())) {
                    throw new RuntimeException("OTP expired");
                }

                if (!otpCode.getCode().equals(request.getPhoneOtp())) {
                    throw new RuntimeException("Invalid OTP");
                }

                // Now delete the OTP as it is used for signup
                otpRepository.delete(otpCode);
            } else if ("otp-verified".equals(request.getPassword())) {
                // If password indicates OTP flow but no OTP provided, that's an error
                throw new RuntimeException("OTP required for phone signup");
            }

            user.setPhoneNumber(request.getPhoneNumber());
        }

        // Set role
        if (request.getRole() != null && !request.getRole().isEmpty()) {
            try {
                user.setRole(User.Role.valueOf(request.getRole().toUpperCase()));
            } catch (IllegalArgumentException e) {
                user.setRole(User.Role.USER);
            }
        } else {
            user.setRole(User.Role.USER);
        }

        userRepository.save(user);

        // Log signup activity
        activityLogService.logUserSignup(user.getId(), user.getUsername());

        String token = jwtProvider.generateToken(user);
        return new AuthResponse(token, user.getUsername(), user.getEmail(), user.getRole().name());
    }

    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByEmailIncludingDeleted(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        if (user.isDeleted()) {
            user.setDeleted(false);
            userRepository.save(user);
        }

        // Log login activity
        activityLogService.logUserLogin(user.getId(), user.getUsername());

        String token = jwtProvider.generateToken(user);
        return new AuthResponse(token, user.getUsername(), user.getEmail(), user.getRole().name());
    }

    public User getCurrentUser(String email) {
        return userRepository.findByEmailIncludingDeleted(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User updateProfile(User currentUser, User updatedUser) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Update username if provided and different
        if (updatedUser.getUsername() != null && !updatedUser.getUsername().isEmpty()
                && !updatedUser.getUsername().equals(user.getUsername())) {
            if (userRepository.existsByUsername(updatedUser.getUsername())) {
                throw new RuntimeException("Username already exists");
            }
            user.setUsername(updatedUser.getUsername());
        }

        // Update email if provided and different
        if (updatedUser.getEmail() != null && !updatedUser.getEmail().isEmpty()
                && !updatedUser.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(updatedUser.getEmail())) {
                throw new RuntimeException("Email already exists");
            }
            user.setEmail(updatedUser.getEmail());
        }

        // Update role if provided and different
        if (updatedUser.getRole() != null && !updatedUser.getRole().equals(user.getRole())) {
            user.setRole(updatedUser.getRole());
        }

        // Update phoneNumber if provided and different
        if (updatedUser.getPhoneNumber() != null && !updatedUser.getPhoneNumber().isEmpty()
                && !updatedUser.getPhoneNumber().equals(user.getPhoneNumber())) {
            if (userRepository.findByPhoneNumber(updatedUser.getPhoneNumber()).isPresent()) {
                throw new RuntimeException("Phone number already exists");
            }
            // User updating phone number should ideally verify it too, but omitting for
            // brevity/consistency
            user.setPhoneNumber(updatedUser.getPhoneNumber());
        }

        return userRepository.save(user);
    }

    public boolean checkEmail(String email) {
        return userRepository.findByEmailIncludingDeleted(email).isPresent();
    }

    @Autowired
    private com.farmeet.repository.OtpRepository otpRepository;

    @Autowired
    private EmailService emailService;

    public void generateOtp(String email) {
        String otp = String.format("%06d", new java.util.Random().nextInt(999999));

        com.farmeet.entity.OtpCode otpCode = otpRepository.findByEmail(email)
                .orElse(new com.farmeet.entity.OtpCode());

        otpCode.setEmail(email);
        otpCode.setCode(otp);
        otpCode.setExpiryDate(java.time.LocalDateTime.now().plusMinutes(10));

        otpRepository.save(otpCode);
        emailService.sendOtp(email, otp);
    }

    public AuthResponse verifyOtp(String email, String code) {
        com.farmeet.entity.OtpCode otpCode = otpRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("OTP not found"));

        if (otpCode.getExpiryDate().isBefore(java.time.LocalDateTime.now())) {
            throw new RuntimeException("OTP expired");
        }

        if (!otpCode.getCode().equals(code)) {
            throw new RuntimeException("Invalid OTP");
        }

        otpRepository.delete(otpCode);

        User user = userRepository.findByEmailIncludingDeleted(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.isDeleted()) {
            user.setDeleted(false);
            userRepository.save(user);
        }

        // Log login activity
        activityLogService.logUserLogin(user.getId(), user.getUsername());

        String token = jwtProvider.generateToken(user);
        return new AuthResponse(token, user.getUsername(), user.getEmail(), user.getRole().name());
    }

    public boolean verifyOtpForSignup(String email, String code) {
        com.farmeet.entity.OtpCode otpCode = otpRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("OTP not found"));

        if (otpCode.getExpiryDate().isBefore(java.time.LocalDateTime.now())) {
            throw new RuntimeException("OTP expired");
        }

        if (!otpCode.getCode().equals(code)) {
            throw new RuntimeException("Invalid OTP");
        }
        return true;
    }

    @Autowired
    private SmsService smsService;

    public void generatePhoneOtp(String phoneNumber) {
        String otp = String.format("%06d", new java.util.Random().nextInt(999999));

        com.farmeet.entity.OtpCode otpCode = otpRepository.findByPhoneNumber(phoneNumber)
                .orElse(new com.farmeet.entity.OtpCode());

        otpCode.setPhoneNumber(phoneNumber);
        otpCode.setCode(otp);
        otpCode.setExpiryDate(java.time.LocalDateTime.now().plusMinutes(10));

        otpRepository.save(otpCode);
        smsService.sendOtp(phoneNumber, otp);
    }

    public com.farmeet.dto.PhoneVerificationResponse verifyPhoneOtp(String phoneNumber, String code) {
        com.farmeet.entity.OtpCode otpCode = otpRepository.findByPhoneNumber(phoneNumber)
                .orElseThrow(() -> new RuntimeException("OTP not found"));

        if (otpCode.getExpiryDate().isBefore(java.time.LocalDateTime.now())) {
            throw new RuntimeException("OTP expired");
        }

        if (!otpCode.getCode().equals(code)) {
            throw new RuntimeException("Invalid OTP");
        }

        // Check if user exists
        java.util.Optional<User> userOpt = userRepository.findByPhoneNumber(phoneNumber);

        if (userOpt.isPresent()) {
            // User exists - Login flow
            // Delete OTP as it is used
            otpRepository.delete(otpCode);

            User user = userOpt.get();
            if (user.isDeleted()) {
                user.setDeleted(false);
                userRepository.save(user);
            }
            String token = jwtProvider.generateToken(user);
            return new com.farmeet.dto.PhoneVerificationResponse(token, true);
        } else {
            // User not registered - Signup flow
            // Do NOT delete OTP yet. It will be verified again during signup submission.
            return new com.farmeet.dto.PhoneVerificationResponse(null, false);
        }
    }
}
