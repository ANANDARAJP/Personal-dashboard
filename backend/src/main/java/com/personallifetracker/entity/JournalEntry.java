package com.personallifetracker.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JournalEntry {
    private Long id;
    private Long userId;
    private String title;
    private String content;
    private String mood;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
