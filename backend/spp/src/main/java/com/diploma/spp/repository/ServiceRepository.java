package com.diploma.spp.repository;

import com.diploma.spp.model.Service;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ServiceRepository extends JpaRepository<Service, Long> {
    List<Service> findBySpecialistProfileId(Long specialistId);
    List<Service> findByCategoryId(Long categoryId);
    List<Service> findByActiveTrue();
}
