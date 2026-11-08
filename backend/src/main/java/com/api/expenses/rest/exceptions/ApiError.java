package com.api.expenses.rest.exceptions;

public record ApiError(String title, int status) {
}
