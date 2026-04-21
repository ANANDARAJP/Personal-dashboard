package com.personallifetracker.repository;

import com.personallifetracker.entity.PasswordEntry;
import com.personallifetracker.storage.InMemoryStorage;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
public class PasswordRepository {
    private final InMemoryStorage storage;

    public PasswordRepository(InMemoryStorage storage) {
        this.storage = storage;
    }

    public List<PasswordEntry> findAllByUserId(Long userId) {
        return storage.getPasswordEntries().values().stream()
                .filter(p -> p.getUserId().equals(userId))
                .collect(Collectors.toList());
    }

    public Optional<PasswordEntry> findById(Long id) {
        return Optional.ofNullable(storage.getPasswordEntries().get(id));
    }

    public PasswordEntry save(PasswordEntry entry) {
        if (entry.getId() == null) {
            entry.setId(storage.getPasswordEntryIdGenerator().getAndIncrement());
        }
        storage.getPasswordEntries().put(entry.getId(), entry);
        return entry;
    }

    public void deleteById(Long id) {
        storage.getPasswordEntries().remove(id);
    }
}
