package com.api.expenses.rest.models.dtos;

import java.sql.Date;
import java.util.Optional;
import java.util.UUID;

public record GetIncomeDto(
    int id,
    UUID userId,
    float amount,
    int currencyId,
    Date date,
    String description,
    int month,
    int year,
    int week,
    Date lastUpdate,
    int categoryId,
    Optional<Integer> tagId
) {
}