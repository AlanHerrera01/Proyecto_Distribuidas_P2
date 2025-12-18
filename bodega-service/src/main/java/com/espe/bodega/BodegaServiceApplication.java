package com.espe.bodega;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class BodegaServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(BodegaServiceApplication.class, args);
	}

}
