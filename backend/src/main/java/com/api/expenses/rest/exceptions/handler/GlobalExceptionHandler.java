package com.api.expenses.rest.exceptions.handler;

import com.api.expenses.rest.exceptions.ApiError;
import com.api.expenses.rest.exceptions.TransactionException;
import com.api.expenses.rest.exceptions.UserException;
import com.fasterxml.jackson.core.JsonProcessingException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    @ExceptionHandler({TransactionException.class})
    ResponseEntity<ApiError> handleTransactionException(TransactionException exception) {
        return switch (exception.getType()) {
            case UNAUTHORIZED -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiError(exception.getMessage(), HttpStatus.UNAUTHORIZED.value()));
            case CATEGORY_NOT_FOUND, TAG_NOT_FOUND, USER_NOT_FOUND,
                CURRENCY_NOT_FOUND, INCOME_NOT_FOUND, EXPENSE_NOT_FOUND
                    -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiError(exception.getMessage(), HttpStatus.NOT_FOUND.value()));
            case FORBIDDEN_ACTION -> ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ApiError(exception.getMessage(), HttpStatus.FORBIDDEN.value()));
            default -> ResponseEntity.badRequest().body(new ApiError(exception.getMessage(), HttpStatus.BAD_REQUEST.value()));
        };
    }

    @ExceptionHandler({UserException.class})
    ResponseEntity<Object> handleUserException(UserException exception) {
        return ResponseEntity.badRequest().body(exception.getMessage());
    }

    @ExceptionHandler({JsonProcessingException.class})
    ResponseEntity<Object> handleSerializationError(JsonProcessingException exception) {
        return ResponseEntity.internalServerError().body(exception.getMessage());
    }

    @ExceptionHandler({Exception.class})
    ResponseEntity<ApiError> handleGenericException(Exception exception) {
        return ResponseEntity.internalServerError().body(new ApiError(exception.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR.value()));
    }
}
