package com.personallifetracker.repository;

import com.personallifetracker.entity.JournalEntry;
import com.personallifetracker.storage.InMemoryStorage;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
public class JournalRepository {
    private final InMemoryStorage storage;

    public JournalRepository(InMemoryStorage storage) {
        this.storage = storage;
    }

    public List<JournalEntry> findAllByUserId(Long userId) {
        return storage.getJournalEntries().values().stream()
                .filter(j -> j.getUserId().equals(userId))
                .collect(Collectors.toList());
    }

    public Optional<JournalEntry> findById(Long id) {
        return Optional.ofNullable(storage.getJournalEntries().get(id));
    }

    public JournalEntry save(JournalEntry entry) {
        if (entry.getId() == null) {
            entry.setId(storage.getJournalIdGenerator().getAndIncrement());
            entry.setCreatedAt(LocalDateTime.now());
        }
        entry.setUpdatedAt(LocalDateTime.now());
        storage.getJournalEntries().put(entry.getId(), entry);
        return entry;
    }

    public void deleteById(Long id) {
        storage.getJournalEntries().remove(id);
    }
}
