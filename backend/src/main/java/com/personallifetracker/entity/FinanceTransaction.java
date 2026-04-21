package com.personallifetracker.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FinanceTransaction {
    private Long id;
    private Long userId;
    private String type; // INCOME, EXPENSE
    private BigDecimal amount;
    private String category;
    private String description;
    private String title;
    private String titleName;
    private String paymentMethod;
    private LocalDate transactionDate;
}
