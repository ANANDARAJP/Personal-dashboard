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
public class Task {
    private Long id;
    private Long userId;
    private String title;
    private String description;
    private LocalDate dueDate;
    private boolean completed;
    private String status; // TODO, IN_PROGRESS, DONE
    private String priority;
    private String category;
}
