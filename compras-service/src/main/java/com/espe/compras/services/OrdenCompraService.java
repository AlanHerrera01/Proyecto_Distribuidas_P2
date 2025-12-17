package com.espe.compras.services;

import com.espe.compras.models.OrdenCompra;
import com.espe.compras.models.DetalleOrden;
import com.espe.compras.models.EstadoOrden;

import java.time.LocalDateTime;
import java.util.List;
import java.math.BigDecimal;

public interface OrdenCompraService {
    
    // Operaciones CRUD básicas
    OrdenCompra crearOrdenCompra(OrdenCompra ordenCompra);
    OrdenCompra obtenerOrdenCompraPorId(Long id);
    List<OrdenCompra> obtenerTodasLasOrdenes();
    OrdenCompra actualizarOrdenCompra(Long id, OrdenCompra ordenCompra);
    void eliminarOrdenCompra(Long id);
    
    // Operaciones de búsqueda
    List<OrdenCompra> buscarOrdenesPorEstado(EstadoOrden estado);
    List<OrdenCompra> buscarOrdenesPorProveedor(Long proveedorId);
    List<OrdenCompra> buscarOrdenesPorRangoFechas(LocalDateTime fechaInicio, LocalDateTime fechaFin);
    List<OrdenCompra> buscarOrdenesPorNumeroFactura(String numeroFactura);
    
    // Operaciones de estado
    OrdenCompra cambiarEstadoOrden(Long id, EstadoOrden nuevoEstado);
    List<OrdenCompra> obtenerOrdenesPendientes();
    List<OrdenCompra> obtenerOrdenesEnProceso();
    List<OrdenCompra> obtenerOrdenesCompletadas();
    List<OrdenCompra> obtenerOrdenesCanceladas();
    
    // Operaciones de detalles
    DetalleOrden agregarDetalleOrden(Long ordenId, DetalleOrden detalle);
    DetalleOrden actualizarDetalleOrden(Long ordenId, Long detalleId, DetalleOrden detalle);
    void eliminarDetalleOrden(Long ordenId, Long detalleId);
    
    // Operaciones de estadísticas
    Long contarOrdenesPorEstado(EstadoOrden estado);
    BigDecimal obtenerTotalComprasPorProveedor(Long proveedorId);
    BigDecimal obtenerTotalComprasPorRangoFechas(LocalDateTime fechaInicio, LocalDateTime fechaFin);
    
    // Validaciones
    boolean existeOrdenConNumeroFactura(String numeroFactura);
    boolean puedeCambiarEstado(Long ordenId, EstadoOrden nuevoEstado);
}
