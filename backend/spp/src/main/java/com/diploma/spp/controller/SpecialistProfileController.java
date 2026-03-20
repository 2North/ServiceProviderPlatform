package com.diploma.spp.controller;

import com.diploma.spp.dto.SpecialistProfileDto;
import com.diploma.spp.service.SpecialistProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/specialists")
@RequiredArgsConstructor
public class SpecialistProfileController {

    private final SpecialistProfileService specialistProfileService;

    @GetMapping("/{id}")
    public SpecialistProfileDto getById(@PathVariable Long id) {
        return specialistProfileService.getById(id);
    }

    @GetMapping("/user/{userId}")
    public SpecialistProfileDto getByUserId(@PathVariable Long userId) {
        return specialistProfileService.getByUserId(userId);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('SPECIALIST')")
    @ResponseStatus(HttpStatus.CREATED)
    public SpecialistProfileDto create(@Valid @RequestBody SpecialistProfileDto dto) {
        return specialistProfileService.create(dto);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('SPECIALIST')")
    public SpecialistProfileDto update(@PathVariable Long id, @Valid @RequestBody SpecialistProfileDto dto) {
        return specialistProfileService.update(id, dto);
    }
}
