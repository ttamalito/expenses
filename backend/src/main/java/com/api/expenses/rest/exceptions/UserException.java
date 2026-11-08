package com.api.expenses.rest.exceptions;

public class UserException extends Exception {

    private final UserExceptionType type;

    public UserException(UserExceptionType type) {
        super(type.getMessage());
        this.type = type;
    }

    public UserException(UserExceptionType type, Throwable cause) {
        super(type.getMessage(), cause);
        this.type = type;
    }

    public UserExceptionType getType() {
        return type;
    }

    public enum UserExceptionType {

        USER_NOT_FOUND("User not found"),
        USER_ALREADY_EXISTS("User already exists"),
        USER_INVALID("Invalid user"),
        USER_NOT_AUTHORIZED("User not authorized");
        private final String message;

        UserExceptionType(String message) {
            this.message = message;
        }
        public String getMessage() {
            return message;
        }


    };
}
