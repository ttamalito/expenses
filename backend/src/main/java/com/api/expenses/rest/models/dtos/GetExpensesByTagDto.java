package com.api.expenses.rest.models.dtos;

import com.api.expenses.rest.models.Expense;

import java.util.List;

public record GetExpensesByTagDto(List<Expense> expenses, float totalSpent) {
}
