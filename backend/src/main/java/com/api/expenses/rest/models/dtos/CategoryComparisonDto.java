package com.api.expenses.rest.models.dtos;

/**
 * DTO for category comparison data between two time periods.
 */
public record CategoryComparisonDto(
    int categoryId,
    String categoryName,
    float currentPeriodAmount,
    float previousPeriodAmount,
    float difference,
    float percentageChange
) {
}