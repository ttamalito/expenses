package com.api.expenses.rest.exceptions.handler;

import com.api.expenses.rest.exceptions.TransactionException;
import com.api.expenses.rest.exceptions.UserException;
import com.fasterxml.jackson.core.JsonProcessingException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    @ExceptionHandler({TransactionException.class})
    ResponseEntity<Object> handleTransactionException(TransactionException exception) {
        return ResponseEntity.badRequest().body(exception.getMessage()); // TODO: Exceptions should be more specific #84
    }

    @ExceptionHandler({UserException.class})
    ResponseEntity<Object> handleUserException(UserException exception) {
        return ResponseEntity.badRequest().body(exception.getMessage()); // TODO: Exceptions should be more specific #84
    }

    @ExceptionHandler({JsonProcessingException.class})
    ResponseEntity<Object> handleSerializationError(JsonProcessingException exception) {
        return ResponseEntity.internalServerError().body(exception.getMessage()); // TODO: Handler should be more specific #84
    }
}
