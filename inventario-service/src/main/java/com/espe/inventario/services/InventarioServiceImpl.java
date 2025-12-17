package com.espe.inventario.services;

import com.espe.inventario.models.Inventario;
import com.espe.inventario.models.Bodega;
import com.espe.inventario.repositories.InventarioRepository;
import com.espe.inventario.repositories.BodegaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class InventarioServiceImpl implements InventarioService {
    
    @Autowired
    private InventarioRepository inventarioRepository;
    
    @Autowired
    private BodegaRepository bodegaRepository;
    
    // Métodos de Inventario
    @Override
    @Transactional(readOnly = true)
    public List<Inventario> findAllInventarios() {
        return inventarioRepository.findAll();
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<Inventario> findInventarioById(Long id) {
        return inventarioRepository.findById(id);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<Inventario> findInventarioByProductoAndBodega(Long productoId, Long bodegaId) {
        return inventarioRepository.findByProductoIdAndBodegaId(productoId, bodegaId);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<Inventario> findInventarioByBodega(Long bodegaId) {
        return inventarioRepository.findByBodegaId(bodegaId);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<Inventario> findInventarioByProducto(Long productoId) {
        return inventarioRepository.findByProductoId(productoId);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<Inventario> findStockCritico() {
        return inventarioRepository.findStockCritico();
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<Inventario> findStockCriticoByBodega(Long bodegaId) {
        return inventarioRepository.findStockCriticoByBodega(bodegaId);
    }
    
    @Override
    public Inventario saveInventario(Inventario inventario) {
        inventario.setUltimaActualizacion(LocalDateTime.now());
        return inventarioRepository.save(inventario);
    }
    
    @Override
    public Inventario updateInventario(Long id, Inventario inventario) {
        Optional<Inventario> inventarioExistente = inventarioRepository.findById(id);
        if (inventarioExistente.isPresent()) {
            Inventario inventarioToUpdate = inventarioExistente.get();
            inventarioToUpdate.setProductoId(inventario.getProductoId());
            inventarioToUpdate.setBodegaId(inventario.getBodegaId());
            inventarioToUpdate.setCantidad(inventario.getCantidad());
            inventarioToUpdate.setCantidadMinima(inventario.getCantidadMinima());
            inventarioToUpdate.setUltimaActualizacion(LocalDateTime.now());
            return inventarioRepository.save(inventarioToUpdate);
        }
        return null;
    }
    
    @Override
    public void deleteInventarioById(Long id) {
        inventarioRepository.deleteById(id);
    }
    
    @Override
    public Inventario actualizarStock(Long productoId, Long bodegaId, Integer nuevaCantidad) {
        Optional<Inventario> inventarioOpt = inventarioRepository.findByProductoIdAndBodegaId(productoId, bodegaId);
        if (inventarioOpt.isPresent()) {
            Inventario inventario = inventarioOpt.get();
            inventario.actualizarCantidad(nuevaCantidad);
            return inventarioRepository.save(inventario);
        }
        return null;
    }
    
    @Override
    public Inventario agregarStock(Long productoId, Long bodegaId, Integer cantidad) {
        Optional<Inventario> inventarioOpt = inventarioRepository.findByProductoIdAndBodegaId(productoId, bodegaId);
        if (inventarioOpt.isPresent()) {
            Inventario inventario = inventarioOpt.get();
            inventario.agregarStock(cantidad);
            return inventarioRepository.save(inventario);
        }
        return null;
    }
    
    @Override
    public Inventario reducirStock(Long productoId, Long bodegaId, Integer cantidad) {
        Optional<Inventario> inventarioOpt = inventarioRepository.findByProductoIdAndBodegaId(productoId, bodegaId);
        if (inventarioOpt.isPresent()) {
            Inventario inventario = inventarioOpt.get();
            inventario.reducirStock(cantidad);
            return inventarioRepository.save(inventario);
        }
        return null;
    }
    
    // Métodos de Bodega
    @Override
    @Transactional(readOnly = true)
    public List<Bodega> findAllBodegas() {
        return bodegaRepository.findAll();
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<Bodega> findBodegaById(Long id) {
        return bodegaRepository.findById(id);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<Bodega> findBodegasByEstado(String estado) {
        return bodegaRepository.findByEstado(estado);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<Bodega> findBodegasByNombreContaining(String nombre) {
        return bodegaRepository.findByNombreContainingAndEstado(nombre, "ACTIVA");
    }
    
    @Override
    public Bodega saveBodega(Bodega bodega) {
        bodega.setFechaCreacion(LocalDateTime.now());
        bodega.setFechaActualizacion(LocalDateTime.now());
        if (bodega.getEstado() == null) {
            bodega.setEstado("ACTIVA");
        }
        return bodegaRepository.save(bodega);
    }
    
    @Override
    public Bodega updateBodega(Long id, Bodega bodega) {
        Optional<Bodega> bodegaExistente = bodegaRepository.findById(id);
        if (bodegaExistente.isPresent()) {
            Bodega bodegaToUpdate = bodegaExistente.get();
            bodegaToUpdate.setNombre(bodega.getNombre());
            bodegaToUpdate.setDireccion(bodega.getDireccion());
            bodegaToUpdate.setCapacidad(bodega.getCapacidad());
            bodegaToUpdate.setEstado(bodega.getEstado());
            bodegaToUpdate.setFechaActualizacion(LocalDateTime.now());
            return bodegaRepository.save(bodegaToUpdate);
        }
        return null;
    }
    
    @Override
    public void deleteBodegaById(Long id) {
        bodegaRepository.deleteById(id);
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean existsBodegaByNombre(String nombre) {
        return bodegaRepository.existsByNombre(nombre);
    }
    
    @Override
    public Bodega cambiarEstadoBodega(Long id, String estado) {
        Optional<Bodega> bodegaExistente = bodegaRepository.findById(id);
        if (bodegaExistente.isPresent()) {
            Bodega bodega = bodegaExistente.get();
            bodega.setEstado(estado);
            bodega.setFechaActualizacion(LocalDateTime.now());
            return bodegaRepository.save(bodega);
        }
        return null;
    }
}
