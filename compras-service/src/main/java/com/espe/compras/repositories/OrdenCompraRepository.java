package com.espe.compras.repositories;

import com.espe.compras.models.OrdenCompra;
import com.espe.compras.models.EstadoOrden;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrdenCompraRepository extends JpaRepository<OrdenCompra, Long> {
    
    // Buscar órdenes por estado
    List<OrdenCompra> findByEstado(EstadoOrden estado);
    
    // Buscar órdenes por proveedor
    List<OrdenCompra> findByProveedorId(Long proveedorId);
    
    // Buscar órdenes por rango de fechas
    @Query("SELECT o FROM OrdenCompra o WHERE o.fechaEmision BETWEEN :fechaInicio AND :fechaFin")
    List<OrdenCompra> findByFechaEmisionBetween(
            @Param("fechaInicio") LocalDateTime fechaInicio,
            @Param("fechaFin") LocalDateTime fechaFin
    );
    
    // Buscar órdenes por número de factura (búsqueda insensible a mayúsculas)
    List<OrdenCompra> findByNumeroFacturaContainingIgnoreCase(String numeroFactura);
    
    // Contar órdenes por estado
    Long countByEstado(EstadoOrden estado);
    
    // Obtener el total de compras por proveedor
    @Query("SELECT SUM(o.total) FROM OrdenCompra o WHERE o.proveedorId = :proveedorId")
    BigDecimal sumTotalByProveedorId(@Param("proveedorId") Long proveedorId);
}
