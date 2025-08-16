package com.api.expenses.rest.models.dtos;

import java.sql.Date;
import java.util.Optional;


public record CreateExpenseDto(int categoryId, float amount, int currencyId, Date date, String description, Optional<Integer> tagId) {
}
