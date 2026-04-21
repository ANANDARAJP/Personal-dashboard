package com.personallifetracker.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class OfficeAttendanceRequest {
    private LocalDate date;
    private String type; // IN or OUT
    private String time; // HH:mm
}
