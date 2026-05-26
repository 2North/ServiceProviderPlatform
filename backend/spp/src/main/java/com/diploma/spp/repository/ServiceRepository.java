package com.diploma.spp.repository;

import com.diploma.spp.model.ServiceListing;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ServiceRepository extends JpaRepository<ServiceListing, Long> {
    List<ServiceListing> findBySpecialistProfileId(Long specialistId);
    List<ServiceListing> findByCategoryId(Long categoryId);
    Page<ServiceListing> findByCategoryId(Long categoryId, Pageable pageable);
    Page<ServiceListing> findByActiveTrue(Pageable pageable);
}
