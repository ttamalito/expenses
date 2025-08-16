package com.api.expenses.rest.models.dtos;

import java.sql.Date;
import java.util.Optional;

public record CreateIncomeDto(int categoryId, float amount, Date date, int currencyId, String description, Optional<Integer> tagId) {
}
