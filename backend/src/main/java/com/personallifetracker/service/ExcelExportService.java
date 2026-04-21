package com.personallifetracker.service;

import com.personallifetracker.dto.DashboardResponse;
import com.personallifetracker.entity.User;
import com.personallifetracker.repository.UserRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

@Service
public class ExcelExportService {

    private final DashboardService dashboardService;
    private final UserRepository userRepository;

    public ExcelExportService(DashboardService dashboardService, UserRepository userRepository) {
        this.dashboardService = dashboardService;
        this.userRepository = userRepository;
    }

    public byte[] exportMonthEndData(String email) throws IOException {
        DashboardResponse data = dashboardService.getDashboardData(email);
        User user = userRepository.findByEmail(email).get();

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Month End Report");

            int rowIdx = 0;
            Row headerRow = sheet.createRow(rowIdx++);
            headerRow.createCell(0).setCellValue("Metric");
            headerRow.createCell(1).setCellValue("Value");

            createRow(sheet, rowIdx++, "User", user.getFirstName() + " " + user.getLastName());
            createRow(sheet, rowIdx++, "Total Goals", String.valueOf(data.getTotalGoals()));
            createRow(sheet, rowIdx++, "Completed Goals", String.valueOf(data.getCompletedGoals()));
            createRow(sheet, rowIdx++, "Goal Completion Rate", data.getGoalCompletionRate() + "%");
            createRow(sheet, rowIdx++, "Pending Tasks", String.valueOf(data.getPendingTasks()));
            createRow(sheet, rowIdx++, "Tasks Completed Today", String.valueOf(data.getTasksCompletedToday()));
            createRow(sheet, rowIdx++, "Net Worth", data.getNetWorth().toString());
            createRow(sheet, rowIdx++, "Monthly Income", data.getMonthlyIncome().toString());
            createRow(sheet, rowIdx++, "Monthly Expense", data.getMonthlyExpense().toString());
            createRow(sheet, rowIdx++, "Monthly Savings", data.getMonthlySavings().toString());

            workbook.write(out);
            return out.toByteArray();
        }
    }

    private void createRow(Sheet sheet, int idx, String label, String value) {
        Row row = sheet.createRow(idx);
        row.createCell(0).setCellValue(label);
        row.createCell(1).setCellValue(value);
    }
}
