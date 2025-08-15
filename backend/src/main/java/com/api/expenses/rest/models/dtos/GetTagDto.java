package com.api.expenses.rest.models.dtos;

import java.util.UUID;

public record GetTagDto(int id, String name, String description,UUID userId) {
}