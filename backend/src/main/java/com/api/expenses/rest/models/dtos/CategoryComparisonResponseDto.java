package com.api.expenses.rest.models.dtos;

import java.util.List;

/**
 * Response DTO for category comparison data between two time periods.
 */
public record CategoryComparisonResponseDto(
    String currentPeriodLabel,
    String previousPeriodLabel,
    List<CategoryComparisonDto> categories,
    float totalCurrentPeriod,
    float totalPreviousPeriod,
    float totalDifference,
    float totalPercentageChange
) {
}