package com.personallifetracker.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class DashboardResponse {
    private int totalGoals;
    private int completedGoals;
    private int inProgressGoals;
    private double goalCompletionRate;
    
    private int pendingTasks;
    private int tasksCompletedToday;
    private int totalTasks;
    private int overdueTasks;
    
    private BigDecimal netWorth;
    private BigDecimal monthlyIncome;
    private BigDecimal monthlyExpense;
    private BigDecimal monthlySavings;
    
    private double avgMoodScore;
    private int totalSkills;
}
