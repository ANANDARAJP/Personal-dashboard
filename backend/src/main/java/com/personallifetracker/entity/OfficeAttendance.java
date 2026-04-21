package com.personallifetracker.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OfficeAttendance {
    private Long id;
    private Long userId;
    private LocalDate date;
    private LocalTime inTime;
    private LocalTime outTime;
    private String status; // PRESENT, ABSENT, LEAVE
    private String location;
}
