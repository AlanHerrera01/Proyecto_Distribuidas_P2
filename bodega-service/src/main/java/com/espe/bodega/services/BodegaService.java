package com.espe.bodega.services;

import com.espe.bodega.models.Bodega;
import java.util.List;
import java.util.Optional;

public interface BodegaService {
    
    List<Bodega> findAll();
    
    Optional<Bodega> findById(Long id);
    
    Optional<Bodega> findByNombre(String nombre);
    
    Bodega save(Bodega bodega);
    
    Bodega update(Long id, Bodega bodega);
    
    void deleteById(Long id);
    
    boolean existsByNombre(String nombre);
    
    List<Bodega> findByEstado(String estado);
}
