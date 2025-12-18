package com.espe.bodega.controllers;

import com.espe.bodega.models.Bodega;
import com.espe.bodega.services.BodegaService;
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
    private BodegaService bodegaService;
    
    @GetMapping
    public ResponseEntity<List<Bodega>> getAllBodegas() {
        List<Bodega> bodegas = bodegaService.findAll();
        return ResponseEntity.ok(bodegas);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Bodega> getBodegaById(@PathVariable Long id) {
        Optional<Bodega> bodega = bodegaService.findById(id);
        return bodega.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/nombre/{nombre}")
    public ResponseEntity<Bodega> getBodegaByNombre(@PathVariable String nombre) {
        Optional<Bodega> bodega = bodegaService.findByNombre(nombre);
        return bodega.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<Bodega>> getBodegasByEstado(@PathVariable String estado) {
        List<Bodega> bodegas = bodegaService.findByEstado(estado);
        return ResponseEntity.ok(bodegas);
    }
    
    @PostMapping
    public ResponseEntity<Bodega> createBodega(@Valid @RequestBody Bodega bodega) {
        // Validar que no exista una bodega con el mismo nombre
        if (bodegaService.existsByNombre(bodega.getNombre())) {
            return new ResponseEntity<>(HttpStatus.CONFLICT);
        }
        
        Bodega nuevaBodega = bodegaService.save(bodega);
        return new ResponseEntity<>(nuevaBodega, HttpStatus.CREATED);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Bodega> updateBodega(@PathVariable Long id, 
                                             @Valid @RequestBody Bodega bodega) {
        Bodega bodegaActualizada = bodegaService.update(id, bodega);
        if (bodegaActualizada != null) {
            return ResponseEntity.ok(bodegaActualizada);
        }
        return ResponseEntity.notFound().build();
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBodega(@PathVariable Long id) {
        Optional<Bodega> bodega = bodegaService.findById(id);
        if (bodega.isPresent()) {
            bodegaService.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
    
    @PatchMapping("/{id}/estado")
    public ResponseEntity<Bodega> cambiarEstado(@PathVariable Long id, 
                                              @RequestParam String nuevoEstado) {
        Optional<Bodega> bodegaOptional = bodegaService.findById(id);
        if (bodegaOptional.isPresent()) {
            Bodega bodega = bodegaOptional.get();
            bodega.setEstado(nuevoEstado);
            Bodega bodegaActualizada = bodegaService.save(bodega);
            return ResponseEntity.ok(bodegaActualizada);
        }
        return ResponseEntity.notFound().build();
    }
}
