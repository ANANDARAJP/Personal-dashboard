package com.personallifetracker.controller;

import com.personallifetracker.dto.ApiResponse;
import com.personallifetracker.entity.Habit;
import com.personallifetracker.entity.HabitLog;
import com.personallifetracker.entity.User;
import com.personallifetracker.repository.HabitRepository;
import com.personallifetracker.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/habits")
public class HabitController {

    private final HabitRepository habitRepository;
    private final UserRepository userRepository;

    public HabitController(HabitRepository habitRepository, UserRepository userRepository) {
        this.habitRepository = habitRepository;
        this.userRepository = userRepository;
    }

    private Long getUserId(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .map(User::getId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Habit>>> getHabits(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(habitRepository.findAllByUserId(getUserId(authentication))));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Habit>> createHabit(Authentication authentication, @RequestBody Habit habit) {
        habit.setUserId(getUserId(authentication));
        return ResponseEntity.ok(ApiResponse.success(habitRepository.save(habit)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Habit>> updateHabit(Authentication authentication, @PathVariable Long id, @RequestBody Habit habitDetails) {
        Long userId = getUserId(authentication);
        return habitRepository.findById(id)
                .filter(h -> h.getUserId().equals(userId))
                .map(existing -> {
                    existing.setName(habitDetails.getName());
                    existing.setDescription(habitDetails.getDescription());
                    existing.setCategory(habitDetails.getCategory());
                    existing.setColor(habitDetails.getColor());
                    existing.setTargetDaysPerWeek(habitDetails.getTargetDaysPerWeek());
                    existing.setReminderTime(habitDetails.getReminderTime());
                    existing.setFrequency(habitDetails.getFrequency());
                    return ResponseEntity.ok(ApiResponse.success(habitRepository.save(existing)));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteHabit(Authentication authentication, @PathVariable Long id) {
        Long userId = getUserId(authentication);
        return habitRepository.findById(id)
                .filter(h -> h.getUserId().equals(userId))
                .map(h -> {
                    habitRepository.deleteById(id);
                    return ResponseEntity.ok(ApiResponse.<Void>success(null));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/log")
    public ResponseEntity<ApiResponse<HabitLog>> logHabit(Authentication authentication, @PathVariable Long id, @RequestBody HabitLog log) {
        Long userId = getUserId(authentication);
        return habitRepository.findById(id)
                .filter(h -> h.getUserId().equals(userId))
                .map(habit -> {
                    log.setHabitId(id);
                    // Check if log for this date already exists and update it, otherwise create new
                    List<HabitLog> existingLogs = habitRepository.findLogsByHabitId(id);
                    HabitLog logToSave = existingLogs.stream()
                            .filter(l -> l.getDate().equals(log.getDate()))
                            .findFirst()
                            .map(existing -> {
                                existing.setStatus(log.getStatus());
                                return existing;
                            })
                            .orElse(log);
                    
                    return ResponseEntity.ok(ApiResponse.success(habitRepository.saveLog(logToSave)));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/logs/by-date")
    public ResponseEntity<ApiResponse<List<HabitLog>>> getLogsByDate(Authentication authentication, @RequestParam String date) {
        return ResponseEntity.ok(ApiResponse.success(habitRepository.findLogsByDate(date, getUserId(authentication))));
    }
}
