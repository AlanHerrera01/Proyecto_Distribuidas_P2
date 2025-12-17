package com.espe.producto.repositories;

import com.espe.producto.models.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {
    
    Optional<Producto> findBySku(String sku);
    
    Optional<Producto> findByNombre(String nombre);
    
    List<Producto> findByCategoria(String categoria);
    
    List<Producto> findByEstado(String estado);
    
    List<Producto> findByCategoriaAndEstado(String categoria, String estado);
    
    @Query("SELECT p FROM Producto p WHERE p.nombre LIKE %:nombre% AND p.estado = :estado")
    List<Producto> findByNombreContainingAndEstado(@Param("nombre") String nombre, @Param("estado") String estado);
    
    boolean existsBySku(String sku);
    
    boolean existsByNombre(String nombre);
}
