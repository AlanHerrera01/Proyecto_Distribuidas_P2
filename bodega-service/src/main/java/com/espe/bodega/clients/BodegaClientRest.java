package com.espe.bodega.clients;

import com.espe.bodega.dto.BodegaDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Optional;

@FeignClient(name = "bodega", url = "localhost:8085")
public interface BodegaClientRest {

    @GetMapping("/api/bodegas/{id}")
    Optional<BodegaDTO> findById(@PathVariable("id") Long id);
}
