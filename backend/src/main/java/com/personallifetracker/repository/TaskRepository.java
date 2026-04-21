package com.personallifetracker.repository;

import com.personallifetracker.entity.Task;
import com.personallifetracker.storage.InMemoryStorage;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
public class TaskRepository {
    private final InMemoryStorage storage;

    public TaskRepository(InMemoryStorage storage) {
        this.storage = storage;
    }

    public long countByUserIdAndCompleted(Long userId, boolean completed) {
        return storage.getTasks().values().stream()
                .filter(t -> t.getUserId().equals(userId) && t.isCompleted() == completed)
                .count();
    }

    public List<Task> findByUserIdAndDueDate(Long userId, LocalDate date) {
        return storage.getTasks().values().stream()
                .filter(t -> t.getUserId().equals(userId) && 
                           date.equals(t.getDueDate()))
                .collect(Collectors.toList());
    }

    public List<Task> findByUserIdAndDueDateBefore(Long userId, LocalDate date) {
        return storage.getTasks().values().stream()
                .filter(t -> t.getUserId().equals(userId) && 
                           t.getDueDate() != null && t.getDueDate().isBefore(date))
                .collect(Collectors.toList());
    }

    public List<Task> findByUserIdAndDueDateAndCompleted(Long userId, LocalDate date, boolean completed) {
        return storage.getTasks().values().stream()
                .filter(t -> t.getUserId().equals(userId) && 
                           date.equals(t.getDueDate()) && 
                           t.isCompleted() == completed)
                .collect(Collectors.toList());
    }

    public List<Task> findByUserIdAndDueDateBeforeAndCompleted(Long userId, LocalDate date, boolean completed) {
        return storage.getTasks().values().stream()
                .filter(t -> t.getUserId().equals(userId) && 
                           t.getDueDate() != null && t.getDueDate().isBefore(date) && 
                           t.isCompleted() == completed)
                .collect(Collectors.toList());
    }

    public long countByUserId(Long userId) {
        return storage.getTasks().values().stream()
                .filter(t -> t.getUserId().equals(userId))
                .count();
    }

    public List<Task> findAllByUserId(Long userId) {
        return storage.getTasks().values().stream()
                .filter(t -> t.getUserId().equals(userId))
                .collect(Collectors.toList());
    }

    public Optional<Task> findById(Long id) {
        return Optional.ofNullable(storage.getTasks().get(id));
    }

    public Task save(Task task) {
        if (task.getId() == null) {
            task.setId(storage.getTaskIdGenerator().getAndIncrement());
        }
        if (task.getStatus() == null) {
            task.setStatus(task.isCompleted() ? "DONE" : "TODO");
        }
        if (task.getPriority() == null) {
            task.setPriority("MEDIUM");
        }
        // Sync completed boolean with status
        task.setCompleted("DONE".equalsIgnoreCase(task.getStatus()));
        
        storage.getTasks().put(task.getId(), task);
        return task;
    }

    public void deleteById(Long id) {
        storage.getTasks().remove(id);
    }
}
