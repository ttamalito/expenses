package com.api.expenses.rest.models.dtos;

public record UpdateExpenseCategoryDto(int categoryId, String description, String name, Float budget) {
}
