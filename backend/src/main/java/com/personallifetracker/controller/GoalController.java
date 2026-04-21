package com.personallifetracker.controller;

import com.personallifetracker.dto.ApiResponse;
import com.personallifetracker.entity.Goal;
import com.personallifetracker.entity.User;
import com.personallifetracker.repository.GoalRepository;
import com.personallifetracker.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/goals")
public class GoalController {

    private final GoalRepository goalRepository;
    private final UserRepository userRepository;

    public GoalController(GoalRepository goalRepository, UserRepository userRepository) {
        this.goalRepository = goalRepository;
        this.userRepository = userRepository;
    }

    private Long getUserId(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .map(User::getId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Goal>>> getGoals(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(goalRepository.findAllByUserId(getUserId(authentication))));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Goal>> createGoal(Authentication authentication, @RequestBody Goal goal) {
        goal.setUserId(getUserId(authentication));
        return ResponseEntity.ok(ApiResponse.success(goalRepository.save(goal)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Goal>> updateGoal(Authentication authentication, @PathVariable Long id, @RequestBody Goal goalDetails) {
        Long userId = getUserId(authentication);
        return goalRepository.findById(id)
                .filter(g -> g.getUserId().equals(userId))
                .map(existingGoal -> {
                    existingGoal.setTitle(goalDetails.getTitle());
                    existingGoal.setDescription(goalDetails.getDescription());
                    existingGoal.setTargetDate(goalDetails.getTargetDate());
                    existingGoal.setStatus(goalDetails.getStatus());
                    return ResponseEntity.ok(ApiResponse.success(goalRepository.save(existingGoal)));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteGoal(Authentication authentication, @PathVariable Long id) {
        Long userId = getUserId(authentication);
        return goalRepository.findById(id)
                .filter(g -> g.getUserId().equals(userId))
                .map(goal -> {
                    goalRepository.deleteById(id);
                    return ResponseEntity.ok(ApiResponse.<Void>success(null));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
