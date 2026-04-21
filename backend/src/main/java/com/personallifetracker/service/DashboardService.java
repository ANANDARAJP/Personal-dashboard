package com.personallifetracker.service;

import com.personallifetracker.dto.DashboardResponse;
import com.personallifetracker.entity.User;
import com.personallifetracker.repository.*;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;

@Service
public class DashboardService {
    private final TaskRepository taskRepository;
    private final GoalRepository goalRepository;
    private final FinanceTransactionRepository financeRepository;
    private final UserRepository userRepository;

    public DashboardService(TaskRepository taskRepository,
                            GoalRepository goalRepository,
                            FinanceTransactionRepository financeRepository,
                            UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.goalRepository = goalRepository;
        this.financeRepository = financeRepository;
        this.userRepository = userRepository;
    }

    public DashboardResponse getDashboardData(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        Long userId = user.getId();
        LocalDate now = LocalDate.now();
        LocalDate firstDayOfMonth = now.with(TemporalAdjusters.firstDayOfMonth());
        LocalDate lastDayOfMonth = now.with(TemporalAdjusters.lastDayOfMonth());

        DashboardResponse response = new DashboardResponse();

        // Goal Metrics
        long totalGoals = goalRepository.countByUserId(userId);
        long completedGoals = goalRepository.countByUserIdAndStatus(userId, "COMPLETED");
        long inProgressGoals = goalRepository.countByUserIdAndStatus(userId, "IN_PROGRESS");
        response.setTotalGoals((int) totalGoals);
        response.setCompletedGoals((int) completedGoals);
        response.setInProgressGoals((int) inProgressGoals);
        response.setGoalCompletionRate(totalGoals > 0 ? (double) completedGoals * 100 / totalGoals : 0.0);

        // Task Metrics
        long pendingTasks = taskRepository.countByUserIdAndCompleted(userId, false);
        long completedToday = taskRepository.findByUserIdAndDueDateAndCompleted(userId, now, true).size();
        long totalTasks = taskRepository.countByUserId(userId);
        long overdueTasks = taskRepository.findByUserIdAndDueDateBeforeAndCompleted(userId, now, false).size();
        
        response.setPendingTasks((int) pendingTasks);
        response.setTasksCompletedToday((int) completedToday);
        response.setTotalTasks((int) totalTasks);
        response.setOverdueTasks((int) overdueTasks);

        // Finance Metrics
        BigDecimal netWorth = financeRepository.calculateNetWorth(userId);
        response.setNetWorth(netWorth != null ? netWorth : BigDecimal.ZERO);

        BigDecimal monthlyIncome = financeRepository.sumIncomeByUserIdAndTransactionDateBetween(userId, firstDayOfMonth, lastDayOfMonth);
        BigDecimal monthlyExpense = financeRepository.sumExpenseByUserIdAndTransactionDateBetween(userId, firstDayOfMonth, lastDayOfMonth);
        
        monthlyIncome = monthlyIncome != null ? monthlyIncome : BigDecimal.ZERO;
        monthlyExpense = monthlyExpense != null ? monthlyExpense : BigDecimal.ZERO;
        
        response.setMonthlyIncome(monthlyIncome);
        response.setMonthlyExpense(monthlyExpense);
        response.setMonthlySavings(monthlyIncome.subtract(monthlyExpense));

        // Mood Placeholder
        response.setAvgMoodScore(7.5);
        response.setTotalSkills(0);

        return response;
    }
}
