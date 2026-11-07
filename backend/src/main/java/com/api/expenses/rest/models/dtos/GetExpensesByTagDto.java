package com.api.expenses.rest.models.dtos;

import java.util.List;

public record GetExpensesByTagDto(List<GetExpenseDto> expenses, float totalSpent) {
}