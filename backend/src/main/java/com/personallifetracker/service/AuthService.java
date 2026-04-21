package com.personallifetracker.service;

import com.personallifetracker.dto.AuthRequest;
import com.personallifetracker.dto.AuthResponse;
import com.personallifetracker.dto.RegisterRequest;
import com.personallifetracker.entity.User;
import com.personallifetracker.repository.UserRepository;
import com.personallifetracker.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final com.personallifetracker.repository.PasswordResetTokenRepository tokenRepository;

    public void forgotPassword(String email) {
        if (!userRepository.existsByEmail(email)) {
            throw new RuntimeException("User not found");
        }

        tokenRepository.deleteByEmail(email);
        
        // Generate a random 9-character secure code
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        java.security.SecureRandom random = new java.security.SecureRandom();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 9; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        String token = sb.toString();
        
        var resetToken = com.personallifetracker.entity.PasswordResetToken.builder()
                .token(token)
                .email(email)
                .expiryDate(java.time.LocalDateTime.now().plusHours(1))
                .build();
        tokenRepository.save(resetToken);
        
        // In a real app, send email. Here just print or return success.
        System.out.println("Password reset token for " + email + ": " + token);
    }

    public void resetPassword(String token, String newPassword) {
        var resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid token"));

        if (resetToken.isExpired()) {
            tokenRepository.deleteByToken(token);
            throw new RuntimeException("Token expired");
        }

        var user = userRepository.findByEmail(resetToken.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        tokenRepository.deleteByToken(token);
    }

    public AuthResponse login(AuthRequest request) {
        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );
        } catch (org.springframework.security.authentication.BadCredentialsException e) {
            System.err.println("Authentication failed for user: " + request.getEmail());
            throw new RuntimeException("Password incorrect");
        } catch (org.springframework.security.core.AuthenticationException e) {
            System.err.println("Authentication error: " + e.getMessage());
            throw new RuntimeException("Login failed: " + e.getMessage());
        }

        var jwtToken = jwtService.generateToken(user);
        var refreshToken = jwtService.generateRefreshToken(user);

        return AuthResponse.builder()
                .accessToken(jwtToken)
                .refreshToken(refreshToken)
                .user(mapUserToMap(user))
                .build();
    }

    public AuthResponse register(RegisterRequest request) {
        // Registration is disabled for static-only, but logic provided as fallback
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        var user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .enabled(true)
                .build();
        user = userRepository.save(user);

        var jwtToken = jwtService.generateToken(user);
        var refreshToken = jwtService.generateRefreshToken(user);

        return AuthResponse.builder()
                .accessToken(jwtToken)
                .refreshToken(refreshToken)
                .user(mapUserToMap(user))
                .build();
    }

    public AuthResponse refresh(Map<String, String> request) {
        String refreshToken = request.get("refreshToken");
        String userEmail = jwtService.extractUsername(refreshToken);

        if (userEmail != null) {
            var user = userRepository.findByEmail(userEmail)
                    .orElseThrow();
            if (jwtService.isTokenValid(refreshToken, user)) {
                var accessToken = jwtService.generateToken(user);
                return AuthResponse.builder()
                        .accessToken(accessToken)
                        .refreshToken(refreshToken)
                        .user(mapUserToMap(user))
                        .build();
            }
        }
        throw new RuntimeException("Invalid refresh token");
    }

    public Map<String, Object> getUserData(User user) {
        return mapUserToMap(user);
    }

    private Map<String, Object> mapUserToMap(User user) {
        return Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "firstName", user.getFirstName() != null ? user.getFirstName() : "",
                "lastName", user.getLastName() != null ? user.getLastName() : "",
                "role", user.getRole() != null ? user.getRole() : "USER",
                "bio", user.getBio() != null ? user.getBio() : "",
                "phone", user.getPhone() != null ? user.getPhone() : "",
                "timezone", user.getTimezone() != null ? user.getTimezone() : "UTC",
                "profileImageUrl", user.getProfileImageUrl() != null ? user.getProfileImageUrl() : ""
        );
    }
}
