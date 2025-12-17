package com.espe.proveedor.services;

import com.espe.proveedor.models.Proveedor;
import java.util.List;
import java.util.Optional;

public interface ProveedorService {
    
    List<Proveedor> findAll();
    
    Optional<Proveedor> findById(Long id);
    
    Optional<Proveedor> findByNitRuc(String nitRuc);
    
    List<Proveedor> findByEstado(String estado);
    
    List<Proveedor> findByNombreContaining(String nombre);
    
    Proveedor save(Proveedor proveedor);
    
    Proveedor update(Long id, Proveedor proveedor);
    
    void deleteById(Long id);
    
    boolean existsByNitRuc(String nitRuc);
    
    boolean existsByEmail(String email);
    
    Proveedor cambiarEstado(Long id, String estado);
}
