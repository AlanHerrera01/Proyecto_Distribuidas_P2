package com.espe.inventario.models;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Column;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Positive;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
public class Inventario {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull(message = "El ID del producto es obligatorio")
    @Column(name = "producto_id", nullable = false)
    private Long productoId;
    
    @NotNull(message = "El ID de la bodega es obligatorio")
    @Column(name = "bodega_id", nullable = false)
    private Long bodegaId;
    
    @NotNull(message = "La cantidad es obligatoria")
    @Min(value = 0, message = "La cantidad no puede ser negativa")
    @Column(nullable = false)
    private Integer cantidad;
    
    @NotNull(message = "La cantidad mínima es obligatoria")
    @Min(value = 0, message = "La cantidad mínima no puede ser negativa")
    @Column(name = "cantidad_minima", nullable = false)
    private Integer cantidadMinima;
    
    @Column(name = "ultima_actualizacion")
    private LocalDateTime ultimaActualizacion;
    
    @ManyToOne
    @JoinColumn(name = "bodega_id", insertable = false, updatable = false)
    @JsonIgnoreProperties({"inventarios"})
    private Bodega bodega;
    
    // Constructores
    public Inventario() {
        this.ultimaActualizacion = LocalDateTime.now();
        this.cantidadMinima = 10; // Valor por defecto
    }
    
    // Getters y Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getProductoId() {
        return productoId;
    }
    
    public void setProductoId(Long productoId) {
        this.productoId = productoId;
    }
    
    public Long getBodegaId() {
        return bodegaId;
    }
    
    public void setBodegaId(Long bodegaId) {
        this.bodegaId = bodegaId;
    }
    
    public Integer getCantidad() {
        return cantidad;
    }
    
    public void setCantidad(Integer cantidad) {
        this.cantidad = cantidad;
    }
    
    public Integer getCantidadMinima() {
        return cantidadMinima;
    }
    
    public void setCantidadMinima(Integer cantidadMinima) {
        this.cantidadMinima = cantidadMinima;
    }
    
    public LocalDateTime getUltimaActualizacion() {
        return ultimaActualizacion;
    }
    
    public void setUltimaActualizacion(LocalDateTime ultimaActualizacion) {
        this.ultimaActualizacion = ultimaActualizacion;
    }
    
    public Bodega getBodega() {
        return bodega;
    }
    
    public void setBodega(Bodega bodega) {
        this.bodega = bodega;
    }
    
    @jakarta.persistence.PreUpdate
    public void preUpdate() {
        this.ultimaActualizacion = LocalDateTime.now();
    }
    
    // Métodos de negocio
    public boolean esStockCritico() {
        return cantidad <= cantidadMinima;
    }
    
    public void actualizarCantidad(Integer nuevaCantidad) {
        this.cantidad = nuevaCantidad;
        this.ultimaActualizacion = LocalDateTime.now();
    }
    
    public void agregarStock(Integer cantidadAgregar) {
        this.cantidad += cantidadAgregar;
        this.ultimaActualizacion = LocalDateTime.now();
    }
    
    public void reducirStock(Integer cantidadReducir) {
        if (this.cantidad >= cantidadReducir) {
            this.cantidad -= cantidadReducir;
            this.ultimaActualizacion = LocalDateTime.now();
        } else {
            throw new RuntimeException("Stock insuficiente");
        }
    }
}
