package com.api.expenses.rest.models.dtos;

import java.util.Map;

/**
 * DTO for statistical summaries.
 * Contains various financial statistics for a user.
 */
public record StatisticalSummaryDto(
    // Highest spending statistics
    HighestSpendingDto highestSpending,
    
    // Savings statistics
    SavingsDto savings,
    
    // Average spending statistics
    AverageSpendingDto averageSpending,
    
    // Budget streak statistics
    BudgetStreakDto budgetStreak
) {
    /**
     * DTO for highest spending statistics.
     */
    public record HighestSpendingDto(
        DaySpendingDto highestSpendingDay,
        MonthSpendingDto highestSpendingMonth,
        CategorySpendingDto highestSpendingCategory
    ) {}
    
    /**
     * DTO for day spending statistics.
     */
    public record DaySpendingDto(
        String date,
        float amount
    ) {}
    
    /**
     * DTO for month spending statistics.
     */
    public record MonthSpendingDto(
        int month,
        int year,
        float amount
    ) {}
    
    /**
     * DTO for category spending statistics.
     */
    public record CategorySpendingDto(
        int categoryId,
        String categoryName,
        float amount
    ) {}
    
    /**
     * DTO for savings statistics.
     */
    public record SavingsDto(
        float averageMonthlySavingsRate,
        Map<String, Float> monthlySavingsPercentage // Key: "MM-YYYY", Value: percentage
    ) {}
    
    /**
     * DTO for average spending statistics.
     */
    public record AverageSpendingDto(
        float averageDailySpend,
        float averageWeeklySpend
    ) {}
    
    /**
     * DTO for budget streak statistics.
     */
    public record BudgetStreakDto(
        int longestStreakDays,
        String streakStartDate,
        String streakEndDate
    ) {}
}