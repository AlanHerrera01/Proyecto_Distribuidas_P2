package com.espe.compras.repositories;

import com.espe.compras.models.DetalleOrden;
import com.espe.compras.models.OrdenCompra;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface DetalleOrdenRepository extends JpaRepository<DetalleOrden, Long> {
    
    // Buscar detalles por orden de compra
    List<DetalleOrden> findByOrdenCompra(OrdenCompra ordenCompra);
    
    // Buscar detalles por producto
    List<DetalleOrden> findByProductoId(Long productoId);
    
    // Obtener el total de ventas por producto
    @Query("SELECT SUM(d.cantidad) FROM DetalleOrden d WHERE d.productoId = :productoId")
    Integer sumCantidadByProductoId(@Param("productoId") Long productoId);
    
    // Obtener el monto total de ventas por producto
    @Query("SELECT SUM(d.subtotal) FROM DetalleOrden d WHERE d.productoId = :productoId")
    BigDecimal sumSubtotalByProductoId(@Param("productoId") Long productoId);
    
    // Verificar si un producto está siendo usado en alguna orden
    boolean existsByProductoId(Long productoId);
}
