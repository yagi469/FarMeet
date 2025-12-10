package com.farmeet.config;

import com.farmeet.entity.User;
import com.farmeet.repository.UserRepository;
import com.farmeet.security.JwtProvider;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtProvider jwtProvider;
    private final UserRepository userRepository;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    public OAuth2SuccessHandler(JwtProvider jwtProvider, UserRepository userRepository) {
        this.jwtProvider = jwtProvider;
        this.userRepository = userRepository;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String picture = oAuth2User.getAttribute("picture");

        // Find or create user
        User user = userRepository.findByEmailIncludingDeleted(email)
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setEmail(email);
                    newUser.setUsername(name != null ? name : email.split("@")[0]);
                    newUser.setAvatarUrl(picture);
                    newUser.setRole(User.Role.USER);
                    // Generate random password for OAuth users
                    newUser.setPassword(java.util.UUID.randomUUID().toString());
                    return userRepository.save(newUser);
                });

        // Restore if deleted
        if (user.isDeleted()) {
            user.setDeleted(false);
            userRepository.save(user);
        }

        // Update avatar if changed
        if (picture != null && !picture.equals(user.getAvatarUrl())) {
            user.setAvatarUrl(picture);
            userRepository.save(user);
        }

        // Generate JWT token
        String token = jwtProvider.generateToken(user);

        // Redirect to frontend with token
        String redirectUrl = frontendUrl + "/oauth-callback?token=" + token;
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}
