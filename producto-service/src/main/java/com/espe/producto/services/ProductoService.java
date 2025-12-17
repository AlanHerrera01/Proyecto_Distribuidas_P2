package com.espe.producto.services;

import com.espe.producto.models.Producto;
import java.util.List;
import java.util.Optional;

public interface ProductoService {
    
    List<Producto> findAll();
    
    Optional<Producto> findById(Long id);
    
    Optional<Producto> findBySku(String sku);
    
    List<Producto> findByCategoria(String categoria);
    
    List<Producto> findByEstado(String estado);
    
    List<Producto> findByNombreContaining(String nombre);
    
    Producto save(Producto producto);
    
    Producto update(Long id, Producto producto);
    
    void deleteById(Long id);
    
    boolean existsBySku(String sku);
    
    boolean existsByNombre(String nombre);
    
    Producto cambiarEstado(Long id, String estado);
}
