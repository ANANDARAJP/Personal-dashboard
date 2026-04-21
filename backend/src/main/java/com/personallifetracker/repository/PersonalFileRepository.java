package com.personallifetracker.repository;

import com.personallifetracker.entity.PersonalFile;
import com.personallifetracker.storage.InMemoryStorage;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
public class PersonalFileRepository {
    private final InMemoryStorage storage;

    public PersonalFileRepository(InMemoryStorage storage) {
        this.storage = storage;
    }

    public List<PersonalFile> findAllByUserId(Long userId) {
        return storage.getPersonalFiles().values().stream()
                .filter(f -> f.getUserId().equals(userId))
                .collect(Collectors.toList());
    }

    public Optional<PersonalFile> findById(Long id) {
        return Optional.ofNullable(storage.getPersonalFiles().get(id));
    }

    public PersonalFile save(PersonalFile file) {
        if (file.getId() == null) {
            file.setId(storage.getFileIdGenerator().getAndIncrement());
            file.setCreatedAt(LocalDateTime.now());
        }
        storage.getPersonalFiles().put(file.getId(), file);
        return file;
    }

    public void deleteById(Long id) {
        storage.getPersonalFiles().remove(id);
    }
}
