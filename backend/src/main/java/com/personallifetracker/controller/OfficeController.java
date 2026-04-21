package com.personallifetracker.controller;

import com.personallifetracker.dto.ApiResponse;
import com.personallifetracker.dto.OfficeAttendanceRequest;
import com.personallifetracker.dto.OfficeTodayResponse;
import com.personallifetracker.entity.OfficeAttendance;
import com.personallifetracker.entity.OfficeSummary;
import com.personallifetracker.entity.User;
import com.personallifetracker.repository.OfficeRepository;
import com.personallifetracker.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/office")
public class OfficeController {

    private final OfficeRepository officeRepository;
    private final UserRepository userRepository;

    public OfficeController(OfficeRepository officeRepository, UserRepository userRepository) {
        this.officeRepository = officeRepository;
        this.userRepository = userRepository;
    }

    private Long getUserId(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .map(User::getId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping("/today")
    public ResponseEntity<ApiResponse<OfficeTodayResponse>> getTodayAttendance(Authentication authentication) {
        Long userId = getUserId(authentication);
        LocalDate today = LocalDate.now();
        
        OfficeAttendance attendance = officeRepository.findAttendanceByUserIdAndDate(userId, today).orElse(null);
        OfficeSummary summary = officeRepository.findSummaryByUserIdAndDate(userId, today).orElse(null);
        
        OfficeTodayResponse response = OfficeTodayResponse.builder()
                .inTime(attendance != null ? attendance.getInTime() : null)
                .outTime(attendance != null ? attendance.getOutTime() : null)
                .summary(summary != null ? summary.getSummary() : null)
                .build();
                
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<OfficeAttendance>>> getHistory(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(officeRepository.findAttendanceHistory(getUserId(authentication))));
    }

    @PostMapping("/attendance")
    public ResponseEntity<ApiResponse<OfficeAttendance>> markAttendance(Authentication authentication, @RequestBody OfficeAttendanceRequest request) {
        Long userId = getUserId(authentication);
        LocalDate date = request.getDate() != null ? request.getDate() : LocalDate.now();
        
        LocalTime parsedTime = request.getTime() != null ? LocalTime.parse(request.getTime()) : LocalTime.now();
        
        OfficeAttendance attendance = officeRepository.findAttendanceByUserIdAndDate(userId, date)
                .orElseGet(() -> {
                    OfficeAttendance newAtt = new OfficeAttendance();
                    newAtt.setUserId(userId);
                    newAtt.setDate(date);
                    newAtt.setStatus("PRESENT");
                    newAtt.setLocation("OFFICE");
                    return newAtt;
                });
                
        if ("IN".equalsIgnoreCase(request.getType())) {
            attendance.setInTime(parsedTime);
        } else if ("OUT".equalsIgnoreCase(request.getType())) {
            attendance.setOutTime(parsedTime);
        }
        
        return ResponseEntity.ok(ApiResponse.success(officeRepository.saveAttendance(attendance)));
    }

    @PostMapping("/summary")
    public ResponseEntity<ApiResponse<OfficeSummary>> saveSummary(Authentication authentication, @RequestBody OfficeSummary summary) {
        Long userId = getUserId(authentication);
        summary.setUserId(userId);
        if (summary.getDate() == null) {
            summary.setDate(LocalDate.now());
        }
        
        // Update existing summary for the day if it exists
        OfficeSummary toSave = officeRepository.findSummaryByUserIdAndDate(userId, summary.getDate())
                .map(existing -> {
                    existing.setSummary(summary.getSummary());
                    existing.setNextDayPlan(summary.getNextDayPlan());
                    existing.setBlockers(summary.getBlockers());
                    return existing;
                })
                .orElse(summary);
                
        return ResponseEntity.ok(ApiResponse.success(officeRepository.saveSummary(toSave)));
    }
}
