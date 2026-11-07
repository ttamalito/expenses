package com.api.expenses.rest.models.dtos;

public record UpdateIncomeCategoryDto(int categoryId, String description, String name) {
}
