package com.diploma.spp.controller;

import com.diploma.spp.dto.ServiceDto;
import com.diploma.spp.service.ServiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
public class ServiceController {

    private final ServiceService serviceService;

    @GetMapping
    public List<ServiceDto> getAll() {
        return serviceService.getAll();
    }

    @GetMapping("/{id}")
    public ServiceDto getById(@PathVariable Long id) {
        return serviceService.getById(id);
    }

    @GetMapping("/specialist/{specialistId}")
    public List<ServiceDto> getBySpecialist(@PathVariable Long specialistId) {
        return serviceService.getBySpecialist(specialistId);
    }

    @GetMapping("/category/{categoryId}")
    public List<ServiceDto> getByCategory(@PathVariable Long categoryId) {
        return serviceService.getByCategory(categoryId);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('SPECIALIST')")
    @ResponseStatus(HttpStatus.CREATED)
    public ServiceDto create(@Valid @RequestBody ServiceDto dto) {
        return serviceService.create(dto);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('SPECIALIST')")
    public ServiceDto update(@PathVariable Long id, @Valid @RequestBody ServiceDto dto) {
        return serviceService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('SPECIALIST')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        serviceService.delete(id);
    }
}