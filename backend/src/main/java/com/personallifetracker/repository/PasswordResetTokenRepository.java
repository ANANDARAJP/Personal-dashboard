package com.personallifetracker.repository;

import com.personallifetracker.entity.PasswordResetToken;
import com.personallifetracker.storage.InMemoryStorage;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public class PasswordResetTokenRepository {
    private final InMemoryStorage storage;

    public PasswordResetTokenRepository(InMemoryStorage storage) {
        this.storage = storage;
    }

    public void save(PasswordResetToken token) {
        storage.getPasswordResetTokens().put(token.getToken(), token);
    }

    public Optional<PasswordResetToken> findByToken(String token) {
        return Optional.ofNullable(storage.getPasswordResetTokens().get(token));
    }

    public void deleteByToken(String token) {
        storage.getPasswordResetTokens().remove(token);
    }
    
    public void deleteByEmail(String email) {
        storage.getPasswordResetTokens().values().removeIf(t -> t.getEmail().equals(email));
    }
}
