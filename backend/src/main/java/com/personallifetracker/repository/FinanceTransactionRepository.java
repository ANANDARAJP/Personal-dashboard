package com.personallifetracker.repository;

import com.personallifetracker.entity.FinanceTransaction;
import com.personallifetracker.storage.InMemoryStorage;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
public class FinanceTransactionRepository {
    private final InMemoryStorage storage;

    public FinanceTransactionRepository(InMemoryStorage storage) {
        this.storage = storage;
    }

    public BigDecimal calculateNetWorth(Long userId) {
        return storage.getTransactions().values().stream()
                .filter(t -> t.getUserId().equals(userId))
                .map(t -> t.getType().equals("INCOME") ? t.getAmount() : t.getAmount().negate())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public BigDecimal sumIncomeByUserIdAndTransactionDateBetween(Long userId, LocalDate start, LocalDate end) {
        return sumByTypeByUserIdAndDateBetween(userId, "INCOME", start, end);
    }

    public BigDecimal sumExpenseByUserIdAndTransactionDateBetween(Long userId, LocalDate start, LocalDate end) {
        return sumByTypeByUserIdAndDateBetween(userId, "EXPENSE", start, end);
    }

    public BigDecimal sumSavingsByUserIdAndTransactionDateBetween(Long userId, LocalDate start, LocalDate end) {
        return sumByTypeByUserIdAndDateBetween(userId, "SAVINGS", start, end);
    }

    public BigDecimal sumInvestmentByUserIdAndTransactionDateBetween(Long userId, LocalDate start, LocalDate end) {
        return sumByTypeByUserIdAndDateBetween(userId, "INVESTMENT", start, end);
    }

    private BigDecimal sumByTypeByUserIdAndDateBetween(Long userId, String type, LocalDate start, LocalDate end) {
        return storage.getTransactions().values().stream()
                .filter(t -> t.getUserId().equals(userId) && type.equals(t.getType())
                        && t.getTransactionDate() != null
                        && !t.getTransactionDate().isBefore(start) && !t.getTransactionDate().isAfter(end))
                .map(FinanceTransaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public List<FinanceTransaction> findAllByUserId(Long userId) {
        return storage.getTransactions().values().stream()
                .filter(t -> t.getUserId().equals(userId))
                .collect(Collectors.toList());
    }

    public Optional<FinanceTransaction> findById(Long id) {
        return Optional.ofNullable(storage.getTransactions().get(id));
    }

    public FinanceTransaction save(FinanceTransaction transaction) {
        if (transaction.getId() == null) {
            transaction.setId(storage.getTransactionIdGenerator().getAndIncrement());
        }
        storage.getTransactions().put(transaction.getId(), transaction);
        return transaction;
    }

    public void deleteById(Long id) {
        storage.getTransactions().remove(id);
    }
}
