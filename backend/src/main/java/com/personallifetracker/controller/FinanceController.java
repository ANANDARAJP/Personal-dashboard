package com.personallifetracker.controller;

import com.personallifetracker.dto.ApiResponse;
import com.personallifetracker.entity.FinanceTransaction;
import com.personallifetracker.entity.User;
import com.personallifetracker.repository.FinanceTransactionRepository;
import com.personallifetracker.repository.UserRepository;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/finance")
public class FinanceController {

    private final FinanceTransactionRepository transactionRepository;
    private final UserRepository userRepository;

    public FinanceController(FinanceTransactionRepository transactionRepository, UserRepository userRepository) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
    }

    private Long getUserId(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .map(User::getId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getTransactions(Authentication authentication) {
        List<FinanceTransaction> transactions = transactionRepository.findAllByUserId(getUserId(authentication));
        Map<String, Object> response = new HashMap<>();
        response.put("content", transactions);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/transactions")
    public ResponseEntity<ApiResponse<FinanceTransaction>> createTransaction(Authentication authentication, @RequestBody FinanceTransaction transaction) {
        transaction.setUserId(getUserId(authentication));
        if (transaction.getTransactionDate() == null) {
            transaction.setTransactionDate(LocalDate.now());
        }
        return ResponseEntity.ok(ApiResponse.success(transactionRepository.save(transaction)));
    }

    @PutMapping("/transactions/{id}")
    public ResponseEntity<ApiResponse<FinanceTransaction>> updateTransaction(Authentication authentication, @PathVariable Long id, @RequestBody FinanceTransaction transactionDetails) {
        Long userId = getUserId(authentication);
        return transactionRepository.findById(id)
                .filter(t -> t.getUserId().equals(userId))
                .map(existing -> {
                    existing.setType(transactionDetails.getType());
                    existing.setAmount(transactionDetails.getAmount());
                    existing.setCategory(transactionDetails.getCategory());
                    existing.setDescription(transactionDetails.getDescription());
                    existing.setTitle(transactionDetails.getTitle());
                    existing.setTitleName(transactionDetails.getTitleName());
                    existing.setPaymentMethod(transactionDetails.getPaymentMethod());
                    existing.setTransactionDate(transactionDetails.getTransactionDate());
                    return ResponseEntity.ok(ApiResponse.success(transactionRepository.save(existing)));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/transactions/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTransaction(Authentication authentication, @PathVariable Long id) {
        Long userId = getUserId(authentication);
        return transactionRepository.findById(id)
                .filter(t -> t.getUserId().equals(userId))
                .map(t -> {
                    transactionRepository.deleteById(id);
                    return ResponseEntity.ok(ApiResponse.<Void>success(null));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<Map<String, BigDecimal>>> getSummary(
            Authentication authentication,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        
        Long userId = getUserId(authentication);
        Map<String, BigDecimal> summary = new HashMap<>();
        summary.put("income", transactionRepository.sumIncomeByUserIdAndTransactionDateBetween(userId, from, to));
        summary.put("expenses", transactionRepository.sumExpenseByUserIdAndTransactionDateBetween(userId, from, to));
        summary.put("savings", transactionRepository.sumSavingsByUserIdAndTransactionDateBetween(userId, from, to));
        summary.put("investments", transactionRepository.sumInvestmentByUserIdAndTransactionDateBetween(userId, from, to));
        summary.put("netWorth", transactionRepository.calculateNetWorth(userId));
        
        return ResponseEntity.ok(ApiResponse.success(summary));
    }
}
