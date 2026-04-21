package com.personallifetracker.repository;

import com.personallifetracker.entity.Goal;
import com.personallifetracker.storage.InMemoryStorage;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
public class GoalRepository {
    private final InMemoryStorage storage;

    public GoalRepository(InMemoryStorage storage) {
        this.storage = storage;
    }

    public long countByUserId(Long userId) {
        return storage.getGoals().values().stream()
                .filter(g -> g.getUserId().equals(userId))
                .count();
    }

    public long countByUserIdAndStatus(Long userId, String status) {
        return storage.getGoals().values().stream()
                .filter(g -> g.getUserId().equals(userId) && status.equals(g.getStatus()))
                .count();
    }

    public List<Goal> findAllByUserId(Long userId) {
        return storage.getGoals().values().stream()
                .filter(g -> g.getUserId().equals(userId))
                .collect(Collectors.toList());
    }

    public Optional<Goal> findById(Long id) {
        return Optional.ofNullable(storage.getGoals().get(id));
    }

    public Goal save(Goal goal) {
        if (goal.getId() == null) {
            goal.setId(storage.getGoalIdGenerator().getAndIncrement());
        }
        if (goal.getStatus() == null) {
            goal.setStatus("NOT_STARTED");
        }
        storage.getGoals().put(goal.getId(), goal);
        return goal;
    }

    public void deleteById(Long id) {
        storage.getGoals().remove(id);
    }
}
