package com.espe.bodega.repositories;

import com.espe.bodega.models.Bodega;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BodegaRepository extends JpaRepository<Bodega, Long> {
    
    Optional<Bodega> findByNombre(String nombre);
    
    boolean existsByNombre(String nombre);
    
    List<Bodega> findByEstado(String estado);
}
