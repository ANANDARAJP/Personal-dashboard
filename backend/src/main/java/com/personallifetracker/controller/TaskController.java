package com.personallifetracker.controller;

import com.personallifetracker.dto.ApiResponse;
import com.personallifetracker.entity.Task;
import com.personallifetracker.entity.User;
import com.personallifetracker.repository.TaskRepository;
import com.personallifetracker.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/tasks")
public class TaskController {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public TaskController(TaskRepository taskRepository, UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }

    private Long getUserId(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .map(User::getId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Task>>> getTasks(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(taskRepository.findAllByUserId(getUserId(authentication))));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Task>> createTask(Authentication authentication, @RequestBody Task task) {
        task.setUserId(getUserId(authentication));
        return ResponseEntity.ok(ApiResponse.success(taskRepository.save(task)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Task>> updateTask(Authentication authentication, @PathVariable Long id, @RequestBody Task taskDetails) {
        Long userId = getUserId(authentication);
        return taskRepository.findById(id)
                .filter(t -> t.getUserId().equals(userId))
                .map(existingTask -> {
                    existingTask.setTitle(taskDetails.getTitle());
                    existingTask.setDescription(taskDetails.getDescription());
                    existingTask.setDueDate(taskDetails.getDueDate());
                    existingTask.setStatus(taskDetails.getStatus());
                    existingTask.setCompleted("DONE".equalsIgnoreCase(taskDetails.getStatus()));
                    existingTask.setPriority(taskDetails.getPriority());
                    existingTask.setCategory(taskDetails.getCategory());
                    return ResponseEntity.ok(ApiResponse.success(taskRepository.save(existingTask)));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTask(Authentication authentication, @PathVariable Long id) {
        Long userId = getUserId(authentication);
        return taskRepository.findById(id)
                .filter(t -> t.getUserId().equals(userId))
                .map(task -> {
                    taskRepository.deleteById(id);
                    return ResponseEntity.ok(ApiResponse.<Void>success(null));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/today")
    public ResponseEntity<ApiResponse<List<Task>>> getTodayTasks(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(taskRepository.findByUserIdAndDueDate(getUserId(authentication), LocalDate.now())));
    }

    @GetMapping("/overdue")
    public ResponseEntity<ApiResponse<List<Task>>> getOverdueTasks(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(taskRepository.findByUserIdAndDueDateBefore(getUserId(authentication), LocalDate.now())));
    }
}
