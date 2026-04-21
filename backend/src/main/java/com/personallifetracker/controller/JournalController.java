package com.personallifetracker.controller;

import com.personallifetracker.dto.ApiResponse;
import com.personallifetracker.entity.JournalEntry;
import com.personallifetracker.entity.User;
import com.personallifetracker.repository.JournalRepository;
import com.personallifetracker.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/journal")
public class JournalController {

    private final JournalRepository journalRepository;
    private final UserRepository userRepository;

    public JournalController(JournalRepository journalRepository, UserRepository userRepository) {
        this.journalRepository = journalRepository;
        this.userRepository = userRepository;
    }

    private Long getUserId(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .map(User::getId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<JournalEntry>>> getEntries(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(journalRepository.findAllByUserId(getUserId(authentication))));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<JournalEntry>> createEntry(Authentication authentication, @RequestBody JournalEntry entry) {
        entry.setUserId(getUserId(authentication));
        return ResponseEntity.ok(ApiResponse.success(journalRepository.save(entry)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<JournalEntry>> updateEntry(Authentication authentication, @PathVariable Long id, @RequestBody JournalEntry entryDetails) {
        Long userId = getUserId(authentication);
        return journalRepository.findById(id)
                .filter(j -> j.getUserId().equals(userId))
                .map(existing -> {
                    existing.setTitle(entryDetails.getTitle());
                    existing.setContent(entryDetails.getContent());
                    existing.setMood(entryDetails.getMood());
                    return ResponseEntity.ok(ApiResponse.success(journalRepository.save(existing)));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteEntry(Authentication authentication, @PathVariable Long id) {
        Long userId = getUserId(authentication);
        return journalRepository.findById(id)
                .filter(j -> j.getUserId().equals(userId))
                .map(j -> {
                    journalRepository.deleteById(id);
                    return ResponseEntity.ok(ApiResponse.<Void>success(null));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
