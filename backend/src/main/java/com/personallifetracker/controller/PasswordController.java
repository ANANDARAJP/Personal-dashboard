package com.personallifetracker.controller;

import com.personallifetracker.dto.ApiResponse;
import com.personallifetracker.entity.PasswordEntry;
import com.personallifetracker.entity.User;
import com.personallifetracker.repository.PasswordRepository;
import com.personallifetracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.security.SecureRandom;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/passwords")
@RequiredArgsConstructor
public class PasswordController {

    private final PasswordRepository passwordRepository;
    private final UserRepository userRepository;

    private User getCurrentUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PasswordEntry>>> getPasswords(Authentication authentication) {
        User user = getCurrentUser(authentication);
        return ResponseEntity.ok(ApiResponse.success(passwordRepository.findAllByUserId(user.getId())));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PasswordEntry>> createPassword(Authentication authentication, @RequestBody PasswordEntry entry) {
        User user = getCurrentUser(authentication);
        entry.setUserId(user.getId());
        return ResponseEntity.ok(ApiResponse.success(passwordRepository.save(entry)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PasswordEntry>> updatePassword(Authentication authentication, @PathVariable Long id, @RequestBody PasswordEntry entry) {
        User user = getCurrentUser(authentication);
        PasswordEntry existing = passwordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Password entry not found"));
        
        if (!existing.getUserId().equals(user.getId())) {
            return ResponseEntity.status(403).build();
        }

        entry.setId(id);
        entry.setUserId(user.getId());
        return ResponseEntity.ok(ApiResponse.success(passwordRepository.save(entry)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePassword(Authentication authentication, @PathVariable Long id) {
        User user = getCurrentUser(authentication);
        PasswordEntry existing = passwordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Password entry not found"));

        if (!existing.getUserId().equals(user.getId())) {
            return ResponseEntity.status(403).build();
        }

        passwordRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping("/generate")
    public ResponseEntity<ApiResponse<Map<String, String>>> generatePassword(@RequestParam(defaultValue = "16") int length) {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < length; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return ResponseEntity.ok(ApiResponse.success(Map.of("password", sb.toString())));
    }
}
