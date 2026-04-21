package com.personallifetracker.service;

import com.personallifetracker.entity.User;
import com.personallifetracker.storage.InMemoryStorage;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Collection;

@Component
public class MonthEndExportTask {

    private final ExcelExportService excelExportService;
    private final InMemoryStorage storage;
    private static final String EXPORT_DIR = "Life_Tracker";

    public MonthEndExportTask(ExcelExportService excelExportService, InMemoryStorage storage) {
        this.excelExportService = excelExportService;
        this.storage = storage;
    }

    @Scheduled(cron = "0 59 23 L * ?")
    public void performMonthEndExport() {
        System.out.println("Starting month-end export task at " + LocalDateTime.now());
        
        try {
            Path path = Paths.get(EXPORT_DIR);
            if (!Files.exists(path)) {
                Files.createDirectories(path);
                System.out.println("Created directory: " + EXPORT_DIR);
            }

            Collection<User> users = storage.getUsersByEmail().values();
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd_HH-mm-ss");
            String timestamp = LocalDateTime.now().format(formatter);

            for (User user : users) {
                try {
                    byte[] excelData = excelExportService.exportMonthEndData(user.getEmail());
                    String fileName = String.format("month_end_report_%s_%s.xlsx", user.getEmail(), timestamp);
                    Path filePath = path.resolve(fileName);
                    
                    try (FileOutputStream fos = new FileOutputStream(filePath.toFile())) {
                        fos.write(excelData);
                    }
                    
                    System.out.println("Exported data for user: " + user.getEmail() + " to " + filePath);
                    
                    // Clear data after export
                    storage.clearData(user.getEmail());
                    System.out.println("Cleared data for user: " + user.getEmail());
                    
                } catch (Exception e) {
                    System.err.println("Failed to export data for user " + user.getEmail() + ": " + e.getMessage());
                }
            }
        } catch (IOException e) {
            System.err.println("Failed to create export directory: " + e.getMessage());
        }
        
        System.out.println("Month-end export task completed.");
    }
}
