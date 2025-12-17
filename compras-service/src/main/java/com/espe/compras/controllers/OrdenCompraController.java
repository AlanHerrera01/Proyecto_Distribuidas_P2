package com.espe.compras.controllers;

import com.espe.compras.models.OrdenCompra;
import com.espe.compras.models.DetalleOrden;
import com.espe.compras.models.EstadoOrden;
import com.espe.compras.services.OrdenCompraService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/ordenes-compra")
@CrossOrigin(origins = "*")
public class OrdenCompraController {

    private final OrdenCompraService ordenCompraService;

    @Autowired
    public OrdenCompraController(OrdenCompraService ordenCompraService) {
        this.ordenCompraService = ordenCompraService;
    }

    // ==================== ENDPOINTS CRUD BÁSICOS ====================

    @PostMapping
    public ResponseEntity<OrdenCompra> crearOrdenCompra(@Valid @RequestBody OrdenCompra ordenCompra) {
        OrdenCompra nuevaOrden = ordenCompraService.crearOrdenCompra(ordenCompra);
        return new ResponseEntity<>(nuevaOrden, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrdenCompra> obtenerOrdenCompraPorId(@PathVariable Long id) {
        OrdenCompra orden = ordenCompraService.obtenerOrdenCompraPorId(id);
        return ResponseEntity.ok(orden);
    }

    @GetMapping
    public ResponseEntity<List<OrdenCompra>> obtenerTodasLasOrdenes() {
        List<OrdenCompra> ordenes = ordenCompraService.obtenerTodasLasOrdenes();
        return ResponseEntity.ok(ordenes);
    }

    @PutMapping("/{id}")
    public ResponseEntity<OrdenCompra> actualizarOrdenCompra(
            @PathVariable Long id,
            @Valid @RequestBody OrdenCompra ordenCompra) {
        OrdenCompra ordenActualizada = ordenCompraService.actualizarOrdenCompra(id, ordenCompra);
        return ResponseEntity.ok(ordenActualizada);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarOrdenCompra(@PathVariable Long id) {
        ordenCompraService.eliminarOrdenCompra(id);
        return ResponseEntity.noContent().build();
    }

    // ==================== ENDPOINTS DE BÚSQUEDA ====================

    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<OrdenCompra>> buscarOrdenesPorEstado(@PathVariable EstadoOrden estado) {
        List<OrdenCompra> ordenes = ordenCompraService.buscarOrdenesPorEstado(estado);
        return ResponseEntity.ok(ordenes);
    }

    @GetMapping("/proveedor/{proveedorId}")
    public ResponseEntity<List<OrdenCompra>> buscarOrdenesPorProveedor(@PathVariable Long proveedorId) {
        List<OrdenCompra> ordenes = ordenCompraService.buscarOrdenesPorProveedor(proveedorId);
        return ResponseEntity.ok(ordenes);
    }

    @GetMapping("/rango-fechas")
    public ResponseEntity<List<OrdenCompra>> buscarOrdenesPorRangoFechas(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaFin) {
        List<OrdenCompra> ordenes = ordenCompraService.buscarOrdenesPorRangoFechas(fechaInicio, fechaFin);
        return ResponseEntity.ok(ordenes);
    }

    @GetMapping("/factura")
    public ResponseEntity<List<OrdenCompra>> buscarOrdenesPorNumeroFactura(
            @RequestParam String numeroFactura) {
        List<OrdenCompra> ordenes = ordenCompraService.buscarOrdenesPorNumeroFactura(numeroFactura);
        return ResponseEntity.ok(ordenes);
    }

    // ==================== ENDPOINTS DE GESTIÓN DE ESTADOS ====================

    @PutMapping("/{id}/estado")
    public ResponseEntity<OrdenCompra> cambiarEstadoOrden(
            @PathVariable Long id,
            @RequestParam EstadoOrden nuevoEstado) {
        OrdenCompra ordenActualizada = ordenCompraService.cambiarEstadoOrden(id, nuevoEstado);
        return ResponseEntity.ok(ordenActualizada);
    }

    @GetMapping("/pendientes")
    public ResponseEntity<List<OrdenCompra>> obtenerOrdenesPendientes() {
        List<OrdenCompra> ordenes = ordenCompraService.obtenerOrdenesPendientes();
        return ResponseEntity.ok(ordenes);
    }

    @GetMapping("/en-proceso")
    public ResponseEntity<List<OrdenCompra>> obtenerOrdenesEnProceso() {
        List<OrdenCompra> ordenes = ordenCompraService.obtenerOrdenesEnProceso();
        return ResponseEntity.ok(ordenes);
    }

    @GetMapping("/completadas")
    public ResponseEntity<List<OrdenCompra>> obtenerOrdenesCompletadas() {
        List<OrdenCompra> ordenes = ordenCompraService.obtenerOrdenesCompletadas();
        return ResponseEntity.ok(ordenes);
    }

    @GetMapping("/canceladas")
    public ResponseEntity<List<OrdenCompra>> obtenerOrdenesCanceladas() {
        List<OrdenCompra> ordenes = ordenCompraService.obtenerOrdenesCanceladas();
        return ResponseEntity.ok(ordenes);
    }

    // ==================== ENDPOINTS DE DETALLES ====================

    @PostMapping("/{id}/detalles")
    public ResponseEntity<DetalleOrden> agregarDetalleOrden(
            @PathVariable Long id,
            @Valid @RequestBody DetalleOrden detalle) {
        DetalleOrden nuevoDetalle = ordenCompraService.agregarDetalleOrden(id, detalle);
        return new ResponseEntity<>(nuevoDetalle, HttpStatus.CREATED);
    }

    @PutMapping("/{id}/detalles/{detalleId}")
    public ResponseEntity<DetalleOrden> actualizarDetalleOrden(
            @PathVariable Long id,
            @PathVariable Long detalleId,
            @Valid @RequestBody DetalleOrden detalle) {
        DetalleOrden detalleActualizado = ordenCompraService.actualizarDetalleOrden(id, detalleId, detalle);
        return ResponseEntity.ok(detalleActualizado);
    }

    @DeleteMapping("/{id}/detalles/{detalleId}")
    public ResponseEntity<Void> eliminarDetalleOrden(
            @PathVariable Long id,
            @PathVariable Long detalleId) {
        ordenCompraService.eliminarDetalleOrden(id, detalleId);
        return ResponseEntity.noContent().build();
    }

    // ==================== ENDPOINTS DE ESTADÍSTICAS ====================

    @GetMapping("/estadisticas/contar-por-estado")
    public ResponseEntity<Long> contarOrdenesPorEstado(@RequestParam EstadoOrden estado) {
        Long count = ordenCompraService.contarOrdenesPorEstado(estado);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/estadisticas/total-por-proveedor/{proveedorId}")
    public ResponseEntity<BigDecimal> obtenerTotalComprasPorProveedor(@PathVariable Long proveedorId) {
        BigDecimal total = ordenCompraService.obtenerTotalComprasPorProveedor(proveedorId);
        return ResponseEntity.ok(total);
    }

    @GetMapping("/estadisticas/total-por-rango-fechas")
    public ResponseEntity<BigDecimal> obtenerTotalComprasPorRangoFechas(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaFin) {
        BigDecimal total = ordenCompraService.obtenerTotalComprasPorRangoFechas(fechaInicio, fechaFin);
        return ResponseEntity.ok(total);
    }

    // ==================== ENDPOINTS DE VALIDACIÓN ====================

    @GetMapping("/validar/numero-factura")
    public ResponseEntity<Boolean> existeOrdenConNumeroFactura(@RequestParam String numeroFactura) {
        boolean existe = ordenCompraService.existeOrdenConNumeroFactura(numeroFactura);
        return ResponseEntity.ok(existe);
    }

    @GetMapping("/{id}/validar/cambio-estado")
    public ResponseEntity<Boolean> puedeCambiarEstado(
            @PathVariable Long id,
            @RequestParam EstadoOrden nuevoEstado) {
        boolean puedeCambiar = ordenCompraService.puedeCambiarEstado(id, nuevoEstado);
        return ResponseEntity.ok(puedeCambiar);
    }

    // ==================== ENDPOINTS ADICIONALES ====================

    @GetMapping("/resumen")
    public ResponseEntity<Object> obtenerResumenOrdenes() {
        var resumen = new Object() {
            public final Long pendientes = ordenCompraService.contarOrdenesPorEstado(EstadoOrden.PENDIENTE);
            public final Long enProceso = ordenCompraService.contarOrdenesPorEstado(EstadoOrden.EN_PROCESO);
            public final Long completadas = ordenCompraService.contarOrdenesPorEstado(EstadoOrden.COMPLETADA);
            public final Long canceladas = ordenCompraService.contarOrdenesPorEstado(EstadoOrden.CANCELADA);
            public final BigDecimal totalMes = ordenCompraService.obtenerTotalComprasPorRangoFechas(
                LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0),
                LocalDateTime.now()
            );
        };
        return ResponseEntity.ok(resumen);
    }
}
