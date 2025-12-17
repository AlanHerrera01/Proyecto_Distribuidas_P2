package com.espe.producto.services;

import com.espe.producto.models.Producto;
import com.espe.producto.repositories.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ProductoServiceImpl implements ProductoService {
    
    @Autowired
    private ProductoRepository productoRepository;
    
    @Override
    @Transactional(readOnly = true)
    public List<Producto> findAll() {
        return productoRepository.findAll();
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<Producto> findById(Long id) {
        return productoRepository.findById(id);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<Producto> findBySku(String sku) {
        return productoRepository.findBySku(sku);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<Producto> findByCategoria(String categoria) {
        return productoRepository.findByCategoria(categoria);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<Producto> findByEstado(String estado) {
        return productoRepository.findByEstado(estado);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<Producto> findByNombreContaining(String nombre) {
        return productoRepository.findByNombreContainingAndEstado(nombre, "ACTIVO");
    }
    
    @Override
    public Producto save(Producto producto) {
        producto.setFechaCreacion(LocalDateTime.now());
        producto.setFechaActualizacion(LocalDateTime.now());
        if (producto.getEstado() == null) {
            producto.setEstado("ACTIVO");
        }
        return productoRepository.save(producto);
    }
    
    @Override
    public Producto update(Long id, Producto producto) {
        Optional<Producto> productoExistente = productoRepository.findById(id);
        if (productoExistente.isPresent()) {
            Producto productoToUpdate = productoExistente.get();
            productoToUpdate.setNombre(producto.getNombre());
            productoToUpdate.setSku(producto.getSku());
            productoToUpdate.setDescripcion(producto.getDescripcion());
            productoToUpdate.setPrecio(producto.getPrecio());
            productoToUpdate.setCategoria(producto.getCategoria());
            productoToUpdate.setEstado(producto.getEstado());
            productoToUpdate.setFechaActualizacion(LocalDateTime.now());
            return productoRepository.save(productoToUpdate);
        }
        return null;
    }
    
    @Override
    public void deleteById(Long id) {
        productoRepository.deleteById(id);
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean existsBySku(String sku) {
        return productoRepository.existsBySku(sku);
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean existsByNombre(String nombre) {
        return productoRepository.existsByNombre(nombre);
    }
    
    @Override
    public Producto cambiarEstado(Long id, String estado) {
        Optional<Producto> productoExistente = productoRepository.findById(id);
        if (productoExistente.isPresent()) {
            Producto producto = productoExistente.get();
            producto.setEstado(estado);
            producto.setFechaActualizacion(LocalDateTime.now());
            return productoRepository.save(producto);
        }
        return null;
    }
}
