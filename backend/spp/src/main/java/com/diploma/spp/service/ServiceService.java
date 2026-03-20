package com.diploma.spp.service;

import com.diploma.spp.dto.ServiceDto;
import com.diploma.spp.model.Category;
import com.diploma.spp.model.SpecialistProfile;
import com.diploma.spp.repository.CategoryRepository;
import com.diploma.spp.repository.ServiceRepository;
import com.diploma.spp.repository.SpecialistProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ServiceService {

    private final ServiceRepository serviceRepository;
    private final SpecialistProfileRepository specialistProfileRepository;
    private final CategoryRepository categoryRepository;

    public List<ServiceDto> getAll() {
        return serviceRepository.findByActiveTrue().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public ServiceDto getById(Long id) {
        com.diploma.spp.model.Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service not found: " + id));
        return toDto(service);
    }

    public List<ServiceDto> getBySpecialist(Long specialistId) {
        return serviceRepository.findBySpecialistProfileId(specialistId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<ServiceDto> getByCategory(Long categoryId) {
        return serviceRepository.findByCategoryId(categoryId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public ServiceDto create(ServiceDto dto) {
        SpecialistProfile specialistProfile = specialistProfileRepository.findById(dto.getSpecialistProfileId())
                .orElseThrow(() -> new RuntimeException("Specialist profile not found: " + dto.getSpecialistProfileId()));

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found: " + dto.getCategoryId()));

        com.diploma.spp.model.Service service = com.diploma.spp.model.Service.builder()
                .specialistProfile(specialistProfile)
                .category(category)
                .title(dto.getTitle())
                .description(dto.getDescription())
                .price(dto.getPrice())
                .duration(dto.getDuration())
                .active(dto.getActive() != null ? dto.getActive() : true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        com.diploma.spp.model.Service saved = serviceRepository.save(service);
        return toDto(saved);
    }

    public ServiceDto update(Long id, ServiceDto dto) {
        com.diploma.spp.model.Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service not found: " + id));

        service.setTitle(dto.getTitle());
        service.setDescription(dto.getDescription());
        service.setPrice(dto.getPrice());
        service.setDuration(dto.getDuration());
        service.setUpdatedAt(LocalDateTime.now());

        com.diploma.spp.model.Service updated = serviceRepository.save(service);
        return toDto(updated);
    }

    public void delete(Long id) {
        com.diploma.spp.model.Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service not found: " + id));
        serviceRepository.delete(service);
    }

    private ServiceDto toDto(com.diploma.spp.model.Service service) {
        return ServiceDto.builder()
                .id(service.getId())
                .title(service.getTitle())
                .description(service.getDescription())
                .price(service.getPrice())
                .duration(service.getDuration())
                .active(service.isActive())
                .categoryId(service.getCategory().getId())
                .specialistProfileId(service.getSpecialistProfile().getId())
                .build();
    }
}