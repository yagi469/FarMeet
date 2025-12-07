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

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtProvider jwtProvider;

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
        user.setPassword(passwordEncoder.encode(request.getPassword()));

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
        // Don't delete yet, delete after full signup? Or delete now and issue temporary
        // token?
        // For simplicity, we just return true. The actual signup will create the user.
        // Ideally we should issue a "Registration Token" but keeping it simple as
        // trusted client for now.
    }
}
