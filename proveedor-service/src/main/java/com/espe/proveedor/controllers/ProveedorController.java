package com.espe.proveedor.controllers;

import com.espe.proveedor.models.Proveedor;
import com.espe.proveedor.services.ProveedorService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/proveedores")
@CrossOrigin(origins = "*")
public class ProveedorController {
    
    @Autowired
    private ProveedorService proveedorService;
    
    @GetMapping
    public ResponseEntity<List<Proveedor>> getAllProveedores() {
        List<Proveedor> proveedores = proveedorService.findAll();
        return ResponseEntity.ok(proveedores);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Proveedor> getProveedorById(@PathVariable Long id) {
        Optional<Proveedor> proveedor = proveedorService.findById(id);
        return proveedor.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/nit/{nitRuc}")
    public ResponseEntity<Proveedor> getProveedorByNitRuc(@PathVariable String nitRuc) {
        Optional<Proveedor> proveedor = proveedorService.findByNitRuc(nitRuc);
        return proveedor.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<Proveedor>> getProveedoresByEstado(@PathVariable String estado) {
        List<Proveedor> proveedores = proveedorService.findByEstado(estado);
        return ResponseEntity.ok(proveedores);
    }
    
    @GetMapping("/buscar")
    public ResponseEntity<List<Proveedor>> buscarProveedores(@RequestParam String nombre) {
        List<Proveedor> proveedores = proveedorService.findByNombreContaining(nombre);
        return ResponseEntity.ok(proveedores);
    }
    
    @PostMapping
    public ResponseEntity<?> createProveedor(@Valid @RequestBody Proveedor proveedor) {
        if (proveedorService.existsByNitRuc(proveedor.getNitRuc())) {
            return ResponseEntity.badRequest().body("El NIT/RUC ya existe");
        }
        if (proveedorService.existsByEmail(proveedor.getEmail())) {
            return ResponseEntity.badRequest().body("El email ya está registrado");
        }
        
        Proveedor nuevoProveedor = proveedorService.save(proveedor);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoProveedor);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Proveedor> updateProveedor(@PathVariable Long id, 
                                                     @Valid @RequestBody Proveedor proveedor) {
        Proveedor proveedorActualizado = proveedorService.update(id, proveedor);
        if (proveedorActualizado != null) {
            return ResponseEntity.ok(proveedorActualizado);
        }
        return ResponseEntity.notFound().build();
    }
    
    @PatchMapping("/{id}/estado")
    public ResponseEntity<Proveedor> cambiarEstado(@PathVariable Long id, 
                                                   @RequestParam String estado) {
        Proveedor proveedor = proveedorService.cambiarEstado(id, estado);
        if (proveedor != null) {
            return ResponseEntity.ok(proveedor);
        }
        return ResponseEntity.notFound().build();
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProveedor(@PathVariable Long id) {
        Optional<Proveedor> proveedor = proveedorService.findById(id);
        if (proveedor.isPresent()) {
            proveedorService.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
