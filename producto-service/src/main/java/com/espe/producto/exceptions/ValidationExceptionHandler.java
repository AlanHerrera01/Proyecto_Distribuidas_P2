package com.espe.producto.exceptions;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.dao.DataIntegrityViolationException;

@RestControllerAdvice
public class ValidationExceptionHandler {
    
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ErrorResponse handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(error -> errors.put(error.getField(), error.getDefaultMessage()));
        
        ErrorResponse response = new ErrorResponse(
            Instant.now().toString(),
            HttpStatus.BAD_REQUEST.value(),
            "Error de validación",
            errors
        );
        
        return response;
    }
    
    @ResponseStatus(HttpStatus.CONFLICT)
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ErrorResponse handleDataIntegrityViolationException(DataIntegrityViolationException ex) {
        Map<String, String> errors = new HashMap<>();
        
        if (ex.getMessage() != null) {
            if (ex.getMessage().contains("sku")) {
                errors.put("sku", "El SKU ya existe");
            } else if (ex.getMessage().contains("nombre")) {
                errors.put("nombre", "El nombre del producto ya existe");
            } else {
                errors.put("error", "Violación de integridad de datos");
            }
        }
        
        ErrorResponse response = new ErrorResponse(
            Instant.now().toString(),
            HttpStatus.CONFLICT.value(),
            "Conflicto de datos",
            errors
        );
        
        return response;
    }
}
