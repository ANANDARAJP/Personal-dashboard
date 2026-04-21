package com.personallifetracker.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Goal {
    private Long id;
    private Long userId;
    private String title;
    private String description;
    private LocalDate targetDate;
    private String status; // COMPLETED, IN_PROGRESS
}
