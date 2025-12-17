package com.espe.inventario.repositories;

import com.espe.inventario.models.Bodega;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BodegaRepository extends JpaRepository<Bodega, Long> {
    
    List<Bodega> findByEstado(String estado);
    
    @Query("SELECT b FROM Bodega b WHERE b.nombre LIKE %:nombre% AND b.estado = :estado")
    List<Bodega> findByNombreContainingAndEstado(@Param("nombre") String nombre, @Param("estado") String estado);
    
    boolean existsByNombre(String nombre);
}
