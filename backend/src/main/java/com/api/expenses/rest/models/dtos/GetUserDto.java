package com.api.expenses.rest.models.dtos;

import com.api.expenses.rest.models.Role;

import java.sql.Date;
import java.util.UUID;

public record GetUserDto(UUID id, String username, String email,
                         String profilePicture, Date creationDate, String firstName, String lastName, Role role, int currencyId) {
}
