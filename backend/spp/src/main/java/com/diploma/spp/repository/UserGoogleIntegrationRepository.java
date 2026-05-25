package com.diploma.spp.repository;

import com.diploma.spp.model.UserGoogleIntegration;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserGoogleIntegrationRepository extends JpaRepository<UserGoogleIntegration, Long> {

    Optional<UserGoogleIntegration> findByUser_Id(Long userId);

    void deleteByUser_Id(Long userId);
}
