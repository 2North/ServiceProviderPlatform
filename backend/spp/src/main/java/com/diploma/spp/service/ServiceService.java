package com.diploma.spp.service;

import com.diploma.spp.dto.ServiceDto;
import com.diploma.spp.exception.ForbiddenException;
import com.diploma.spp.exception.ResourceNotFoundException;
import com.diploma.spp.model.Category;
import com.diploma.spp.model.ServiceListing;
import com.diploma.spp.model.SpecialistProfile;
import com.diploma.spp.repository.CategoryRepository;
import com.diploma.spp.repository.ServiceRepository;
import com.diploma.spp.repository.SpecialistProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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

    public Page<ServiceDto> getAll(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return serviceRepository.findByActiveTrue(pageable)
                .map(this::toDto);
    }

    public ServiceDto getById(Long id) {
        ServiceListing serviceListing = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found: " + id));
        return toDto(serviceListing);
    }

    public List<ServiceDto> getBySpecialist(Long specialistId) {
        return serviceRepository.findBySpecialistProfileId(specialistId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public Page<ServiceDto> getByCategory(Long categoryId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return serviceRepository.findByCategoryId(categoryId, pageable)
                .map(this::toDto);
    }

    public ServiceDto create(ServiceDto dto) {
        SpecialistProfile specialistProfile = specialistProfileRepository.findById(dto.getSpecialistProfileId())
                .orElseThrow(() -> new ResourceNotFoundException("Specialist profile not found: " + dto.getSpecialistProfileId()));

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + dto.getCategoryId()));

        ServiceListing serviceListing = ServiceListing.builder()
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

        ServiceListing saved = serviceRepository.save(serviceListing);
        return toDto(saved);
    }

    public ServiceDto update(Long id, ServiceDto dto) {
        ServiceListing serviceListing = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found: " + id));

        if (!serviceListing.getSpecialistProfile().getId().equals(dto.getSpecialistProfileId())) {
            throw new ForbiddenException("You can only edit your own services");
        }

        serviceListing.setTitle(dto.getTitle());
        serviceListing.setDescription(dto.getDescription());
        serviceListing.setPrice(dto.getPrice());
        serviceListing.setDuration(dto.getDuration());
        serviceListing.setUpdatedAt(LocalDateTime.now());

        ServiceListing updated = serviceRepository.save(serviceListing);
        return toDto(updated);
    }

    public void delete(Long id, Long specialistProfileId) {
        ServiceListing serviceListing = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found: " + id));

        if (!serviceListing.getSpecialistProfile().getId().equals(specialistProfileId)) {
            throw new ForbiddenException("You can only delete your own services");
        }

        serviceRepository.delete(serviceListing);
    }

    private ServiceDto toDto(ServiceListing serviceListing) {
        return ServiceDto.builder()
                .id(serviceListing.getId())
                .title(serviceListing.getTitle())
                .description(serviceListing.getDescription())
                .price(serviceListing.getPrice())
                .duration(serviceListing.getDuration())
                .active(serviceListing.isActive())
                .categoryId(serviceListing.getCategory().getId())
                .specialistProfileId(serviceListing.getSpecialistProfile().getId())
                .build();
    }
}