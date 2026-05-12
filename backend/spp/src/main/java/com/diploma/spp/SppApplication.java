package com.diploma.spp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SppApplication {

	public static void main(String[] args) {
		SpringApplication.run(SppApplication.class, args);
	}

}
