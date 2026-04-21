package com.personallifetracker.controller;

import com.personallifetracker.service.ExcelExportService;
import com.personallifetracker.storage.InMemoryStorage;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
@RequestMapping("/api/v1/calculator")
public class CalculatorController {

    private final ExcelExportService excelExportService;
    private final InMemoryStorage storage;

    public CalculatorController(ExcelExportService excelExportService, InMemoryStorage storage) {
        this.excelExportService = excelExportService;
        this.storage = storage;
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportData(Authentication authentication) throws IOException {
        String email = authentication.getName();
        byte[] excelData = excelExportService.exportMonthEndData(email);

        // Erase data after export as requested by user
        storage.clearData(email);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=month_end_report.xlsx")
                .contentType(org.springframework.http.MediaType.APPLICATION_OCTET_STREAM)
                .body(excelData);
    }
}
