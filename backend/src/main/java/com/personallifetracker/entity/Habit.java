package com.personallifetracker.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Habit {
    private Long id;
    private Long userId;
    private String name;
    private String description;
    private String category;
    private int currentStreak;
    private int longestStreak;
    private String color;
    private int targetDaysPerWeek;
    private String reminderTime;
    private String frequency;
}
