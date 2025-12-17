package com.espe.compras.services;

import com.espe.compras.models.OrdenCompra;
import com.espe.compras.models.DetalleOrden;
import com.espe.compras.models.EstadoOrden;
import com.espe.compras.repositories.OrdenCompraRepository;
import com.espe.compras.repositories.DetalleOrdenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class OrdenCompraServiceImpl implements OrdenCompraService {

    private final OrdenCompraRepository ordenCompraRepository;
    private final DetalleOrdenRepository detalleOrdenRepository;

    @Autowired
    public OrdenCompraServiceImpl(OrdenCompraRepository ordenCompraRepository, 
                                 DetalleOrdenRepository detalleOrdenRepository) {
        this.ordenCompraRepository = ordenCompraRepository;
        this.detalleOrdenRepository = detalleOrdenRepository;
    }

    @Override
    public OrdenCompra crearOrdenCompra(OrdenCompra ordenCompra) {
        // Validar que no exista una orden con el mismo número de factura
        if (existeOrdenConNumeroFactura(ordenCompra.getNumeroFactura())) {
            throw new RuntimeException("Ya existe una orden con el número de factura: " + ordenCompra.getNumeroFactura());
        }
        
        // Establecer fecha de creación si no está definida
        if (ordenCompra.getFechaCreacion() == null) {
            ordenCompra.setFechaCreacion(LocalDateTime.now());
        }
        
        // Establecer estado por defecto si no está definido
        if (ordenCompra.getEstado() == null) {
            ordenCompra.setEstado(EstadoOrden.PENDIENTE);
        }
        
        // Calcular totales
        ordenCompra.actualizarTotales();
        
        return ordenCompraRepository.save(ordenCompra);
    }

    @Override
    @Transactional(readOnly = true)
    public OrdenCompra obtenerOrdenCompraPorId(Long id) {
        Optional<OrdenCompra> ordenOpt = ordenCompraRepository.findById(id);
        if (ordenOpt.isPresent()) {
            OrdenCompra orden = ordenOpt.get();
            // Cargar los detalles de la orden
            orden.getDetalles().size(); // Forzar la carga de la colección
            return orden;
        }
        throw new RuntimeException("Orden de compra no encontrada con ID: " + id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrdenCompra> obtenerTodasLasOrdenes() {
        return ordenCompraRepository.findAll();
    }

    @Override
    public OrdenCompra actualizarOrdenCompra(Long id, OrdenCompra ordenCompra) {
        OrdenCompra ordenExistente = obtenerOrdenCompraPorId(id);
        
        // Validar que el nuevo número de factura no exista (si se está cambiando)
        if (!ordenExistente.getNumeroFactura().equals(ordenCompra.getNumeroFactura()) &&
            existeOrdenConNumeroFactura(ordenCompra.getNumeroFactura())) {
            throw new RuntimeException("Ya existe una orden con el número de factura: " + ordenCompra.getNumeroFactura());
        }
        
        // Actualizar campos permitidos
        ordenExistente.setProveedorId(ordenCompra.getProveedorId());
        ordenExistente.setNumeroFactura(ordenCompra.getNumeroFactura());
        ordenExistente.setFechaEmision(ordenCompra.getFechaEmision());
        ordenExistente.setFechaEntrega(ordenCompra.getFechaEntrega());
        ordenExistente.setObservaciones(ordenCompra.getObservaciones());
        
        // No permitir cambiar el estado directamente a través de este método
        // Usar cambiarEstadoOrden en su lugar
        
        return ordenCompraRepository.save(ordenExistente);
    }

    @Override
    public void eliminarOrdenCompra(Long id) {
        OrdenCompra orden = obtenerOrdenCompraPorId(id);
        
        // Solo permitir eliminar órdenes en estado PENDIENTE
        if (orden.getEstado() != EstadoOrden.PENDIENTE) {
            throw new RuntimeException("Solo se pueden eliminar órdenes en estado PENDIENTE");
        }
        
        ordenCompraRepository.delete(orden);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrdenCompra> buscarOrdenesPorEstado(EstadoOrden estado) {
        return ordenCompraRepository.findByEstado(estado);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrdenCompra> buscarOrdenesPorProveedor(Long proveedorId) {
        return ordenCompraRepository.findByProveedorId(proveedorId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrdenCompra> buscarOrdenesPorRangoFechas(LocalDateTime fechaInicio, LocalDateTime fechaFin) {
        return ordenCompraRepository.findByFechaEmisionBetween(fechaInicio, fechaFin);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrdenCompra> buscarOrdenesPorNumeroFactura(String numeroFactura) {
        return ordenCompraRepository.findByNumeroFacturaContainingIgnoreCase(numeroFactura);
    }

    @Override
    public OrdenCompra cambiarEstadoOrden(Long id, EstadoOrden nuevoEstado) {
        OrdenCompra orden = obtenerOrdenCompraPorId(id);
        
        // Validar que se pueda cambiar al nuevo estado
        if (!puedeCambiarEstado(id, nuevoEstado)) {
            throw new RuntimeException("No se puede cambiar la orden de " + orden.getEstado() + " a " + nuevoEstado);
        }
        
        orden.setEstado(nuevoEstado);
        return ordenCompraRepository.save(orden);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrdenCompra> obtenerOrdenesPendientes() {
        return buscarOrdenesPorEstado(EstadoOrden.PENDIENTE);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrdenCompra> obtenerOrdenesEnProceso() {
        return buscarOrdenesPorEstado(EstadoOrden.EN_PROCESO);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrdenCompra> obtenerOrdenesCompletadas() {
        return buscarOrdenesPorEstado(EstadoOrden.COMPLETADA);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrdenCompra> obtenerOrdenesCanceladas() {
        return buscarOrdenesPorEstado(EstadoOrden.CANCELADA);
    }

    @Override
    public DetalleOrden agregarDetalleOrden(Long ordenId, DetalleOrden detalle) {
        OrdenCompra orden = obtenerOrdenCompraPorId(id);
        
        // Validar que la orden esté en estado PENDIENTE
        if (orden.getEstado() != EstadoOrden.PENDIENTE) {
            throw new RuntimeException("Solo se pueden agregar detalles a órdenes en estado PENDIENTE");
        }
        
        // Asignar la orden al detalle
        detalle.setOrdenCompra(orden);
        
        // Guardar el detalle
        DetalleOrden detalleGuardado = detalleOrdenRepository.save(detalle);
        
        // Actualizar totales de la orden
        orden.actualizarTotales();
        ordenCompraRepository.save(orden);
        
        return detalleGuardado;
    }

    @Override
    public DetalleOrden actualizarDetalleOrden(Long ordenId, Long detalleId, DetalleOrden detalle) {
        OrdenCompra orden = obtenerOrdenCompraPorId(id);
        
        // Validar que la orden esté en estado PENDIENTE
        if (orden.getEstado() != EstadoOrden.PENDIENTE) {
            throw new RuntimeException("Solo se pueden actualizar detalles de órdenes en estado PENDIENTE");
        }
        
        Optional<DetalleOrden> detalleOpt = detalleOrdenRepository.findById(detalleId);
        if (detalleOpt.isEmpty() || !detalleOpt.get().getOrdenCompra().getId().equals(ordenId)) {
            throw new RuntimeException("Detalle no encontrado o no pertenece a la orden especificada");
        }
        
        DetalleOrden detalleExistente = detalleOpt.get();
        
        // Actualizar campos
        detalleExistente.setProductoId(detalle.getProductoId());
        detalleExistente.setNombreProducto(detalle.getNombreProducto());
        detalleExistente.setCantidad(detalle.getCantidad());
        detalleExistente.setPrecioUnitario(detalle.getPrecioUnitario());
        detalleExistente.setDescuento(detalle.getDescuento());
        
        // Guardar el detalle actualizado
        DetalleOrden detalleActualizado = detalleOrdenRepository.save(detalleExistente);
        
        // Actualizar totales de la orden
        orden.actualizarTotales();
        ordenCompraRepository.save(orden);
        
        return detalleActualizado;
    }

    @Override
    public void eliminarDetalleOrden(Long ordenId, Long detalleId) {
        OrdenCompra orden = obtenerOrdenCompraPorId(id);
        
        // Validar que la orden esté en estado PENDIENTE
        if (orden.getEstado() != EstadoOrden.PENDIENTE) {
            throw new RuntimeException("Solo se pueden eliminar detalles de órdenes en estado PENDIENTE");
        }
        
        Optional<DetalleOrden> detalleOpt = detalleOrdenRepository.findById(detalleId);
        if (detalleOpt.isEmpty() || !detalleOpt.get().getOrdenCompra().getId().equals(ordenId)) {
            throw new RuntimeException("Detalle no encontrado o no pertenece a la orden especificada");
        }
        
        DetalleOrden detalle = detalleOpt.get();
        
        // Eliminar el detalle
        detalleOrdenRepository.delete(detalle);
        
        // Actualizar totales de la orden
        orden.actualizarTotales();
        ordenCompraRepository.save(orden);
    }

    @Override
    @Transactional(readOnly = true)
    public Long contarOrdenesPorEstado(EstadoOrden estado) {
        return ordenCompraRepository.countByEstado(estado);
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal obtenerTotalComprasPorProveedor(Long proveedorId) {
        BigDecimal total = ordenCompraRepository.sumTotalByProveedorId(proveedorId);
        return total != null ? total : BigDecimal.ZERO;
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal obtenerTotalComprasPorRangoFechas(LocalDateTime fechaInicio, LocalDateTime fechaFin) {
        List<OrdenCompra> ordenes = buscarOrdenesPorRangoFechas(fechaInicio, fechaFin);
        return ordenes.stream()
            .map(OrdenCompra::getTotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existeOrdenConNumeroFactura(String numeroFactura) {
        List<OrdenCompra> ordenes = ordenCompraRepository.findByNumeroFacturaContainingIgnoreCase(numeroFactura);
        return ordenes.stream()
            .anyMatch(orden -> orden.getNumeroFactura().equals(numeroFactura));
    }

    @Override
    @Transactional(readOnly = true)
    public boolean puedeCambiarEstado(Long ordenId, EstadoOrden nuevoEstado) {
        OrdenCompra orden = obtenerOrdenCompraPorId(id);
        EstadoOrden estadoActual = orden.getEstado();
        
        // Reglas de transición de estados
        switch (estadoActual) {
            case PENDIENTE:
                return nuevoEstado == EstadoOrden.EN_PROCESO || nuevoEstado == EstadoOrden.CANCELADA;
            case EN_PROCESO:
                return nuevoEstado == EstadoOrden.COMPLETADA || nuevoEstado == EstadoOrden.CANCELADA;
            case COMPLETADA:
            case CANCELADA:
                return false; // Estados finales
            default:
                return false;
        }
    }
}
