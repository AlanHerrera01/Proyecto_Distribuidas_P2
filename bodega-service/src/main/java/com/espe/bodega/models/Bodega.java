package com.espe.bodega.models;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Column;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@Entity
public class Bodega {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "El nombre de la bodega es obligatorio")
    @Column(nullable = false, unique = true)
    private String nombre;
    
    @NotBlank(message = "La dirección es obligatoria")
    @Column(nullable = false)
    private String direccion;
    
    @NotNull(message = "La capacidad es obligatoria")
    @Positive(message = "La capacidad debe ser positiva")
    @Column(nullable = false)
    private Integer capacidad;
    
    @NotBlank(message = "El estado es obligatorio")
    @Column(nullable = false)
    private String estado;
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getNombre() {
        return nombre;
    }
    
    public void setNombre(String nombre) {
        this.nombre = nombre;
    }
    
    public String getDireccion() {
        return direccion;
    }
    
    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }
    
    public Integer getCapacidad() {
        return capacidad;
    }
    
    public void setCapacidad(Integer capacidad) {
        this.capacidad = capacidad;
    }
    
    public String getEstado() {
        return estado;
    }
    
    public void setEstado(String estado) {
        this.estado = estado;
    }
}
