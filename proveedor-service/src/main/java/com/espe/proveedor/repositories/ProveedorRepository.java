package com.espe.proveedor.repositories;

import com.espe.proveedor.models.Proveedor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProveedorRepository extends JpaRepository<Proveedor, Long> {
    
    Optional<Proveedor> findByNitRuc(String nitRuc);
    
    Optional<Proveedor> findByEmail(String email);
    
    List<Proveedor> findByEstado(String estado);
    
    @Query("SELECT p FROM Proveedor p WHERE p.nombre LIKE %:nombre% AND p.estado = :estado")
    List<Proveedor> findByNombreContainingAndEstado(@Param("nombre") String nombre, @Param("estado") String estado);
    
    boolean existsByNitRuc(String nitRuc);
    
    boolean existsByEmail(String email);
}
