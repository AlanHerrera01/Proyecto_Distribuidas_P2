package com.espe.bodega.services;

import com.espe.bodega.models.Bodega;
import com.espe.bodega.repositories.BodegaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class BodegaServiceImpl implements BodegaService {
    
    @Autowired
    private BodegaRepository bodegaRepository;
    
    @Override
    public List<Bodega> findAll() {
        return bodegaRepository.findAll();
    }
    
    @Override
    public Optional<Bodega> findById(Long id) {
        return bodegaRepository.findById(id);
    }
    
    @Override
    public Optional<Bodega> findByNombre(String nombre) {
        return bodegaRepository.findByNombre(nombre);
    }
    
    @Override
    public Bodega save(Bodega bodega) {
        return bodegaRepository.save(bodega);
    }
    
    @Override
    public Bodega update(Long id, Bodega bodega) {
        Optional<Bodega> bodegaExistente = bodegaRepository.findById(id);
        if (bodegaExistente.isPresent()) {
            bodega.setId(id);
            return bodegaRepository.save(bodega);
        }
        return null;
    }
    
    @Override
    public void deleteById(Long id) {
        bodegaRepository.deleteById(id);
    }
    
    @Override
    public boolean existsByNombre(String nombre) {
        return bodegaRepository.existsByNombre(nombre);
    }
    
    @Override
    public List<Bodega> findByEstado(String estado) {
        return bodegaRepository.findByEstado(estado);
    }
}
