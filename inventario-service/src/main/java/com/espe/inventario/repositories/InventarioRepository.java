package com.espe.inventario.repositories;

import com.espe.inventario.models.Inventario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventarioRepository extends JpaRepository<Inventario, Long> {
    
    Optional<Inventario> findByProductoIdAndBodegaId(Long productoId, Long bodegaId);
    
    List<Inventario> findByBodegaId(Long bodegaId);
    
    List<Inventario> findByProductoId(Long productoId);
    
    @Query("SELECT i FROM Inventario i WHERE i.cantidad <= i.cantidadMinima")
    List<Inventario> findStockCritico();
    
    @Query("SELECT i FROM Inventario i WHERE i.bodegaId = :bodegaId AND i.cantidad <= i.cantidadMinima")
    List<Inventario> findStockCriticoByBodega(@Param("bodegaId") Long bodegaId);
    
    @Query("SELECT i FROM Inventario i WHERE i.productoId = :productoId AND i.cantidad <= i.cantidadMinima")
    List<Inventario> findStockCriticoByProducto(@Param("productoId") Long productoId);
    
    boolean existsByProductoIdAndBodegaId(Long productoId, Long bodegaId);
    
    // Query simplificada para obtener inventarios básicos
    @Query("SELECT i FROM Inventario i")
    List<Inventario> findAllInventariosBasicos();
}
