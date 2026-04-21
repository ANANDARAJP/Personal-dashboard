package com.personallifetracker.controller;

import com.personallifetracker.dto.ApiResponse;
import com.personallifetracker.entity.User;
import com.personallifetracker.repository.UserRepository;
import com.personallifetracker.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final AuthService authService;
    private final PasswordEncoder passwordEncoder;

    private User getCurrentUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getProfile(Authentication authentication) {
        User user = getCurrentUser(authentication);
        return ResponseEntity.ok(ApiResponse.success(authService.getUserData(user)));
    }

    @PatchMapping("/profile")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateProfile(Authentication authentication, @RequestBody Map<String, Object> updates) {
        User user = getCurrentUser(authentication);
        
        if (updates.containsKey("firstName")) user.setFirstName((String) updates.get("firstName"));
        if (updates.containsKey("lastName")) user.setLastName((String) updates.get("lastName"));
        if (updates.containsKey("bio")) user.setBio((String) updates.get("bio"));
        if (updates.containsKey("phone")) user.setPhone((String) updates.get("phone"));
        if (updates.containsKey("timezone")) user.setTimezone((String) updates.get("timezone"));
        
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success(authService.getUserData(user)));
    }

    @PostMapping("/profile/image")
    public ResponseEntity<ApiResponse<String>> uploadProfileImage(Authentication authentication, @RequestParam("file") MultipartFile file) throws IOException {
        User user = getCurrentUser(authentication);
        user.setProfileImageContent(file.getBytes());
        user.setProfileImageContentType(file.getContentType());
        
        String imageUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/v1/users/profile/image/")
                .path(user.getId().toString())
                .toUriString();
                
        user.setProfileImageUrl(imageUrl);
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success(imageUrl));
    }

    @GetMapping(value = "/profile/image/{userId}", produces = {MediaType.IMAGE_JPEG_VALUE, MediaType.IMAGE_PNG_VALUE, MediaType.IMAGE_GIF_VALUE})
    public ResponseEntity<? extends Object> getProfileImage(@PathVariable Long userId) {
        return userRepository.findById(userId)
                .map(user -> {
                    if (user.getProfileImageContent() == null) {
                        String initials = (user.getFirstName() != null ? user.getFirstName() : "U") + "+" + (user.getLastName() != null ? user.getLastName() : "S");
                        String fallbackUrl = "https://ui-avatars.com/api/?name=" + initials + "&background=random&size=128";
                        return ResponseEntity.status(302).header("Location", fallbackUrl).build();
                    }
                    return ResponseEntity.ok()
                            .contentType(MediaType.parseMediaType(user.getProfileImageContentType()))
                            .body(new ByteArrayResource(user.getProfileImageContent()));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(Authentication authentication, @RequestBody Map<String, String> request) {
        User user = getCurrentUser(authentication);
        String currentPassword = request.get("currentPassword");
        String newPassword = request.get("newPassword");

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Incorrect current password"));
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PatchMapping("/change-email")
    public ResponseEntity<ApiResponse<Void>> changeEmail(Authentication authentication, @RequestBody Map<String, String> request) {
        User user = getCurrentUser(authentication);
        String newEmail = request.get("newEmail");
        String password = request.get("password");

        if (!passwordEncoder.matches(password, user.getPassword())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Incorrect password"));
        }

        if (userRepository.existsByEmail(newEmail)) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Email already in use"));
        }

        user.setEmail(newEmail);
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<Map<String, Object>>> adminCreateUser(Authentication authentication, @RequestBody Map<String, String> request) {
        User currentUser = getCurrentUser(authentication);
        if (!"ADMIN".equals(currentUser.getRole())) {
            return ResponseEntity.status(403).body(ApiResponse.error("Admin only"));
        }

        User newUser = User.builder()
                .email(request.get("email"))
                .password(passwordEncoder.encode(request.get("password")))
                .firstName(request.get("name")) // Frontend sends 'name' for this endpoint
                .role(request.getOrDefault("role", "USER"))
                .enabled(true)
                .build();
        
        userRepository.save(newUser);
        return ResponseEntity.ok(ApiResponse.success(authService.getUserData(newUser)));
    }
}
