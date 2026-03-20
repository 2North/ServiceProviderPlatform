package com.diploma.spp.repository;

import com.diploma.spp.model.SpecialistProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SpecialistProfileRepository extends JpaRepository<SpecialistProfile, Long> {
    Optional<SpecialistProfile> findByUserId(Long userId);
}
