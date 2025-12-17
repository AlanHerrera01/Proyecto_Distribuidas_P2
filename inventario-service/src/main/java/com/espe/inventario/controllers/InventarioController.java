package com.espe.inventario.controllers;

import com.espe.inventario.models.Inventario;
import com.espe.inventario.services.InventarioService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/inventario")
@CrossOrigin(origins = "*")
public class InventarioController {
    
    @Autowired
    private InventarioService inventarioService;
    
    // Endpoints de Inventario
    @GetMapping
    public ResponseEntity<List<Inventario>> getAllInventarios() {
        List<Inventario> inventarios = inventarioService.findAllInventarios();
        return ResponseEntity.ok(inventarios);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Inventario> getInventarioById(@PathVariable Long id) {
        Optional<Inventario> inventario = inventarioService.findInventarioById(id);
        return inventario.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/producto/{productoId}/bodega/{bodegaId}")
    public ResponseEntity<Inventario> getInventarioByProductoAndBodega(
            @PathVariable Long productoId, @PathVariable Long bodegaId) {
        Optional<Inventario> inventario = inventarioService.findInventarioByProductoAndBodega(productoId, bodegaId);
        return inventario.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/bodega/{bodegaId}")
    public ResponseEntity<List<Inventario>> getInventarioByBodega(@PathVariable Long bodegaId) {
        List<Inventario> inventarios = inventarioService.findInventarioByBodega(bodegaId);
        return ResponseEntity.ok(inventarios);
    }
    
    @GetMapping("/producto/{productoId}")
    public ResponseEntity<List<Inventario>> getInventarioByProducto(@PathVariable Long productoId) {
        List<Inventario> inventarios = inventarioService.findInventarioByProducto(productoId);
        return ResponseEntity.ok(inventarios);
    }
    
    @GetMapping("/stock-critico")
    public ResponseEntity<List<Inventario>> getStockCritico() {
        List<Inventario> inventarios = inventarioService.findStockCritico();
        return ResponseEntity.ok(inventarios);
    }
    
    @GetMapping("/stock-critico/bodega/{bodegaId}")
    public ResponseEntity<List<Inventario>> getStockCriticoByBodega(@PathVariable Long bodegaId) {
        List<Inventario> inventarios = inventarioService.findStockCriticoByBodega(bodegaId);
        return ResponseEntity.ok(inventarios);
    }
    
    @PostMapping
    public ResponseEntity<Inventario> createInventario(@Valid @RequestBody Inventario inventario) {
        Inventario nuevoInventario = inventarioService.saveInventario(inventario);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoInventario);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Inventario> updateInventario(@PathVariable Long id, 
                                                     @Valid @RequestBody Inventario inventario) {
        Inventario inventarioActualizado = inventarioService.updateInventario(id, inventario);
        if (inventarioActualizado != null) {
            return ResponseEntity.ok(inventarioActualizado);
        }
        return ResponseEntity.notFound().build();
    }
    
    @PatchMapping("/producto/{productoId}/bodega/{bodegaId}/actualizar-stock")
    public ResponseEntity<Inventario> actualizarStock(
            @PathVariable Long productoId, 
            @PathVariable Long bodegaId, 
            @RequestParam Integer nuevaCantidad) {
        Inventario inventario = inventarioService.actualizarStock(productoId, bodegaId, nuevaCantidad);
        if (inventario != null) {
            return ResponseEntity.ok(inventario);
        }
        return ResponseEntity.notFound().build();
    }
    
    @PatchMapping("/producto/{productoId}/bodega/{bodegaId}/agregar-stock")
    public ResponseEntity<Inventario> agregarStock(
            @PathVariable Long productoId, 
            @PathVariable Long bodegaId, 
            @RequestParam Integer cantidad) {
        Inventario inventario = inventarioService.agregarStock(productoId, bodegaId, cantidad);
        if (inventario != null) {
            return ResponseEntity.ok(inventario);
        }
        return ResponseEntity.notFound().build();
    }
    
    @PatchMapping("/producto/{productoId}/bodega/{bodegaId}/reducir-stock")
    public ResponseEntity<Inventario> reducirStock(
            @PathVariable Long productoId, 
            @PathVariable Long bodegaId, 
            @RequestParam Integer cantidad) {
        try {
            Inventario inventario = inventarioService.reducirStock(productoId, bodegaId, cantidad);
            if (inventario != null) {
                return ResponseEntity.ok(inventario);
            }
            return ResponseEntity.notFound().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInventario(@PathVariable Long id) {
        Optional<Inventario> inventario = inventarioService.findInventarioById(id);
        if (inventario.isPresent()) {
            inventarioService.deleteInventarioById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
