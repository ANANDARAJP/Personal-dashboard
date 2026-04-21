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
public class OfficeSummary {
    private Long id;
    private Long userId;
    private LocalDate date;
    private String summary;
    private String nextDayPlan;
    private String blockers;
}
