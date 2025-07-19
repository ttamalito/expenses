package com.api.expenses.rest.models.dtos;

import java.util.List;
import java.util.Map;

/**
 * DTO for budget burn-down chart data.
 * Contains information about budget usage over time for each category.
 */
public record BudgetBurndownDto(
    int month,
    int year,
    List<CategoryBurndownDto> categories
) {
    /**
     * DTO for category-specific burn-down data.
     */
    public record CategoryBurndownDto(
        int categoryId,
        String categoryName,
        float budget,
        float totalSpent,
        Map<Integer, Float> dailySpending,
        Map<Integer, Float> remainingBudget
    ) {}
}