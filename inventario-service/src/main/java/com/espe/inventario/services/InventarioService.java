package com.espe.inventario.services;

import com.espe.inventario.models.Inventario;
import com.espe.inventario.models.Bodega;
import java.util.List;
import java.util.Optional;

public interface InventarioService {
    
    // Métodos para Inventario
    List<Inventario> findAllInventarios();
    
    Optional<Inventario> findInventarioById(Long id);
    
    Optional<Inventario> findInventarioByProductoAndBodega(Long productoId, Long bodegaId);
    
    List<Inventario> findInventarioByBodega(Long bodegaId);
    
    List<Inventario> findInventarioByProducto(Long productoId);
    
    List<Inventario> findStockCritico();
    
    List<Inventario> findStockCriticoByBodega(Long bodegaId);
    
    Inventario saveInventario(Inventario inventario);
    
    Inventario updateInventario(Long id, Inventario inventario);
    
    void deleteInventarioById(Long id);
    
    Inventario actualizarStock(Long productoId, Long bodegaId, Integer nuevaCantidad);
    
    Inventario agregarStock(Long productoId, Long bodegaId, Integer cantidad);
    
    Inventario reducirStock(Long productoId, Long bodegaId, Integer cantidad);
    
    // Métodos para Bodega
    List<Bodega> findAllBodegas();
    
    Optional<Bodega> findBodegaById(Long id);
    
    List<Bodega> findBodegasByEstado(String estado);
    
    List<Bodega> findBodegasByNombreContaining(String nombre);
    
    Bodega saveBodega(Bodega bodega);
    
    Bodega updateBodega(Long id, Bodega bodega);
    
    void deleteBodegaById(Long id);
    
    boolean existsBodegaByNombre(String nombre);
    
    Bodega cambiarEstadoBodega(Long id, String estado);
}
