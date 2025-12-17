package com.espe.inventario.controllers;

import com.espe.inventario.models.Bodega;
import com.espe.inventario.services.InventarioService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/bodegas")
@CrossOrigin(origins = "*")
public class BodegaController {
    
    @Autowired
    private InventarioService inventarioService;
    
    @GetMapping
    public ResponseEntity<List<Bodega>> getAllBodegas() {
        List<Bodega> bodegas = inventarioService.findAllBodegas();
        return ResponseEntity.ok(bodegas);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Bodega> getBodegaById(@PathVariable Long id) {
        Optional<Bodega> bodega = inventarioService.findBodegaById(id);
        return bodega.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<Bodega>> getBodegasByEstado(@PathVariable String estado) {
        List<Bodega> bodegas = inventarioService.findBodegasByEstado(estado);
        return ResponseEntity.ok(bodegas);
    }
    
    @GetMapping("/buscar")
    public ResponseEntity<List<Bodega>> buscarBodegas(@RequestParam String nombre) {
        List<Bodega> bodegas = inventarioService.findBodegasByNombreContaining(nombre);
        return ResponseEntity.ok(bodegas);
    }
    
    @PostMapping
    public ResponseEntity<?> createBodega(@Valid @RequestBody Bodega bodega) {
        if (inventarioService.existsBodegaByNombre(bodega.getNombre())) {
            return ResponseEntity.badRequest().body("El nombre de la bodega ya existe");
        }
        
        Bodega nuevaBodega = inventarioService.saveBodega(bodega);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevaBodega);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Bodega> updateBodega(@PathVariable Long id, 
                                             @Valid @RequestBody Bodega bodega) {
        Bodega bodegaActualizada = inventarioService.updateBodega(id, bodega);
        if (bodegaActualizada != null) {
            return ResponseEntity.ok(bodegaActualizada);
        }
        return ResponseEntity.notFound().build();
    }
    
    @PatchMapping("/{id}/estado")
    public ResponseEntity<Bodega> cambiarEstado(@PathVariable Long id, 
                                               @RequestParam String estado) {
        Bodega bodega = inventarioService.cambiarEstadoBodega(id, estado);
        if (bodega != null) {
            return ResponseEntity.ok(bodega);
        }
        return ResponseEntity.notFound().build();
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBodega(@PathVariable Long id) {
        Optional<Bodega> bodega = inventarioService.findBodegaById(id);
        if (bodega.isPresent()) {
            inventarioService.deleteBodegaById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
