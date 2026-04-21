package com.personallifetracker.repository;

import com.personallifetracker.entity.Habit;
import com.personallifetracker.entity.HabitLog;
import com.personallifetracker.storage.InMemoryStorage;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
public class HabitRepository {
    private final InMemoryStorage storage;

    public HabitRepository(InMemoryStorage storage) {
        this.storage = storage;
    }

    public List<Habit> findAllByUserId(Long userId) {
        return storage.getHabits().values().stream()
                .filter(h -> h.getUserId().equals(userId))
                .collect(Collectors.toList());
    }

    public Optional<Habit> findById(Long id) {
        return Optional.ofNullable(storage.getHabits().get(id));
    }

    public Habit save(Habit habit) {
        if (habit.getId() == null) {
            habit.setId(storage.getHabitIdGenerator().getAndIncrement());
        }
        storage.getHabits().put(habit.getId(), habit);
        return habit;
    }

    public void deleteById(Long id) {
        storage.getHabits().remove(id);
    }

    public HabitLog saveLog(HabitLog log) {
        if (log.getId() == null) {
            log.setId(storage.getHabitLogIdGenerator().getAndIncrement());
        }
        storage.getHabitLogs().put(log.getId(), log);
        return log;
    }

    public List<HabitLog> findLogsByDate(String date, Long userId) {
        List<Long> userHabitIds = findAllByUserId(userId).stream()
                .map(Habit::getId)
                .toList();
        
        return storage.getHabitLogs().values().stream()
                .filter(log -> log.getDate().equals(date) && userHabitIds.contains(log.getHabitId()))
                .collect(Collectors.toList());
    }

    public List<HabitLog> findLogsByHabitId(Long habitId) {
        return storage.getHabitLogs().values().stream()
                .filter(log -> log.getHabitId().equals(habitId))
                .collect(Collectors.toList());
    }
}
