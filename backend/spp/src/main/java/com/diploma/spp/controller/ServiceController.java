package com.diploma.spp.controller;

import com.diploma.spp.dto.ServiceDto;
import com.diploma.spp.service.ServiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
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
    public Page<ServiceDto> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return serviceService.getAll(page, size);
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
    public Page<ServiceDto> getByCategory(
            @PathVariable Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size
    ) {
        return serviceService.getByCategory(categoryId, page, size);
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
    public void delete(@PathVariable Long id, @RequestParam Long specialistProfileId) {
        serviceService.delete(id, specialistProfileId);
    }
}