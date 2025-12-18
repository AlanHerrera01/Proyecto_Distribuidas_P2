package com.espe.compras.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.dao.DataIntegrityViolationException;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class ValidationExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        
        ErrorResponse errorResponse = new ErrorResponse(
            HttpStatus.BAD_REQUEST.value(),
            "Error de validación",
            errors
        );
        
        return ResponseEntity.badRequest().body(errorResponse);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrityViolationException(DataIntegrityViolationException ex) {
        Map<String, String> errors = new HashMap<>();
        String message = "Error de integridad de datos";
        
        if (ex.getMessage() != null) {
            String exMessage = ex.getMessage().toLowerCase();
            
            if (exMessage.contains("numero_factura") || exMessage.contains("uk_numero_factura")) {
                errors.put("numeroFactura", "El número de factura ya existe");
                message = "El número de factura ya existe en el sistema";
            } else if (exMessage.contains("orden_compra_id") && exMessage.contains("cannot be null")) {
                errors.put("detalles", "Error al guardar los detalles de la orden");
                message = "Error interno al procesar los detalles de la orden. Por favor, contacta al administrador.";
            } else if (exMessage.contains("fk_proveedor") || exMessage.contains("proveedor_id")) {
                errors.put("proveedorId", "El proveedor seleccionado no existe");
                message = "El proveedor seleccionado no existe en el sistema";
            } else if (exMessage.contains("fk_producto") || exMessage.contains("producto_id")) {
                errors.put("productoId", "Uno o más productos seleccionados no existen");
                message = "Uno o más productos seleccionados no existen en el sistema";
            } else if (exMessage.contains("duplicate entry") || exMessage.contains("duplicate key")) {
                errors.put("general", "Ya existe un registro con estos datos");
                message = "Ya existe un registro con estos datos";
            } else {
                errors.put("general", "Violación de integridad de datos");
                // Incluir parte del mensaje original para debug
                if (ex.getCause() != null && ex.getCause().getMessage() != null) {
                    String causeMsg = ex.getCause().getMessage();
                    if (causeMsg.length() > 200) {
                        causeMsg = causeMsg.substring(0, 200) + "...";
                    }
                    errors.put("detalle", causeMsg);
                }
            }
        } else {
            errors.put("general", "Error de integridad de datos");
        }
        
        ErrorResponse errorResponse = new ErrorResponse(
            HttpStatus.CONFLICT.value(),
            message,
            errors
        );
        
        return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex) {
        Map<String, String> errors = new HashMap<>();
        errors.put("general", "Error interno del servidor: " + ex.getMessage());
        
        ErrorResponse errorResponse = new ErrorResponse(
            HttpStatus.INTERNAL_SERVER_ERROR.value(),
            "Error interno del servidor",
            errors
        );
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }
}
