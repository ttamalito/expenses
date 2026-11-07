package com.api.expenses.rest.models.dtos;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.sql.Date;
import java.util.UUID;

// NON_NULL keeps the JSON identical to what the entity produced (Transaction is annotated the same way),
// e.g. a missing tag means "tagId" is simply not in the JSON.
@JsonInclude(JsonInclude.Include.NON_NULL)
public record GetExpenseDto(
        int id,
        UUID userId,
        float amount,
        int currencyId,
        Integer tagId,
        Date date,
        String description,
        int month,
        int year,
        int week,
        Date lastUpdate,
        int categoryId
) {
}