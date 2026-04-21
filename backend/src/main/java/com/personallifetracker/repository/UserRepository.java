package com.personallifetracker.repository;

import com.personallifetracker.entity.User;
import com.personallifetracker.storage.InMemoryStorage;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public class UserRepository {
    private final InMemoryStorage storage;

    public UserRepository(InMemoryStorage storage) {
        this.storage = storage;
    }

    public Optional<User> findByEmail(String email) {
        return Optional.ofNullable(storage.getUsersByEmail().get(email));
    }

    public Optional<User> findById(Long id) {
        return Optional.ofNullable(storage.getUsersById().get(id));
    }

    public User save(User user) {
        storage.saveUser(user);
        return user;
    }

    public boolean existsByEmail(String email) {
        return storage.getUsersByEmail().containsKey(email);
    }
}
