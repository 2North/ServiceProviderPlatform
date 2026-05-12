package com.diploma.spp.repository;

import com.diploma.spp.model.ServiceListing;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ServiceRepository extends JpaRepository<ServiceListing, Long> {
    List<ServiceListing> findBySpecialistProfileId(Long specialistId);
    List<ServiceListing> findByCategoryId(Long categoryId);
    List<ServiceListing> findByActiveTrue();
}
