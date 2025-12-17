package com.espe.proveedor.services;

import com.espe.proveedor.models.Proveedor;
import com.espe.proveedor.repositories.ProveedorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ProveedorServiceImpl implements ProveedorService {
    
    @Autowired
    private ProveedorRepository proveedorRepository;
    
    @Override
    @Transactional(readOnly = true)
    public List<Proveedor> findAll() {
        return proveedorRepository.findAll();
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<Proveedor> findById(Long id) {
        return proveedorRepository.findById(id);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<Proveedor> findByNitRuc(String nitRuc) {
        return proveedorRepository.findByNitRuc(nitRuc);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<Proveedor> findByEstado(String estado) {
        return proveedorRepository.findByEstado(estado);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<Proveedor> findByNombreContaining(String nombre) {
        return proveedorRepository.findByNombreContainingAndEstado(nombre, "ACTIVO");
    }
    
    @Override
    public Proveedor save(Proveedor proveedor) {
        proveedor.setFechaCreacion(LocalDateTime.now());
        proveedor.setFechaActualizacion(LocalDateTime.now());
        if (proveedor.getEstado() == null) {
            proveedor.setEstado("ACTIVO");
        }
        return proveedorRepository.save(proveedor);
    }
    
    @Override
    public Proveedor update(Long id, Proveedor proveedor) {
        Optional<Proveedor> proveedorExistente = proveedorRepository.findById(id);
        if (proveedorExistente.isPresent()) {
            Proveedor proveedorToUpdate = proveedorExistente.get();
            proveedorToUpdate.setNombre(proveedor.getNombre());
            proveedorToUpdate.setNitRuc(proveedor.getNitRuc());
            proveedorToUpdate.setContacto(proveedor.getContacto());
            proveedorToUpdate.setEmail(proveedor.getEmail());
            proveedorToUpdate.setTelefono(proveedor.getTelefono());
            proveedorToUpdate.setDireccion(proveedor.getDireccion());
            proveedorToUpdate.setEstado(proveedor.getEstado());
            proveedorToUpdate.setObservaciones(proveedor.getObservaciones());
            proveedorToUpdate.setFechaActualizacion(LocalDateTime.now());
            return proveedorRepository.save(proveedorToUpdate);
        }
        return null;
    }
    
    @Override
    public void deleteById(Long id) {
        proveedorRepository.deleteById(id);
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean existsByNitRuc(String nitRuc) {
        return proveedorRepository.existsByNitRuc(nitRuc);
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {
        return proveedorRepository.existsByEmail(email);
    }
    
    @Override
    public Proveedor cambiarEstado(Long id, String estado) {
        Optional<Proveedor> proveedorExistente = proveedorRepository.findById(id);
        if (proveedorExistente.isPresent()) {
            Proveedor proveedor = proveedorExistente.get();
            proveedor.setEstado(estado);
            proveedor.setFechaActualizacion(LocalDateTime.now());
            return proveedorRepository.save(proveedor);
        }
        return null;
    }
}
