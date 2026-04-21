package com.personallifetracker.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalTime;

@Data
@Builder
public class OfficeTodayResponse {
    private LocalTime inTime;
    private LocalTime outTime;
    private String summary;
}
