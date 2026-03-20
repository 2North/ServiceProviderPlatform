package com.diploma.spp.service;

import com.diploma.spp.dto.SpecialistProfileDto;
import com.diploma.spp.model.SpecialistProfile;
import com.diploma.spp.model.User;
import com.diploma.spp.repository.SpecialistProfileRepository;
import com.diploma.spp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class SpecialistProfileService {

    private final SpecialistProfileRepository specialistProfileRepository;
    private final UserRepository userRepository;

    public SpecialistProfileDto getById(Long id) {
        SpecialistProfile profile = specialistProfileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Specialist profile not found:" + id));
        return toDto(profile);
    }

    public SpecialistProfileDto getByUserId(Long userId) {
        SpecialistProfile profile = specialistProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Specialist profile not found:" + userId));
        return toDto(profile);
    }

    public SpecialistProfileDto create(SpecialistProfileDto dto) {
        User user = userRepository.findByEmail(dto.getUserEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        SpecialistProfile profile = SpecialistProfile.builder()
                .user(user)
                .bio(dto.getBio())
                .experience(dto.getExperience())
                .rating(BigDecimal.ZERO)
                .verified(dto.getVerified() != null ? dto.getVerified() : false)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        SpecialistProfile saved = specialistProfileRepository.save(profile);
        return toDto(saved);
    }

    public SpecialistProfileDto update(Long id, SpecialistProfileDto dto) {
        SpecialistProfile profile = specialistProfileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Specialist profile not found"));

        profile.setBio(dto.getBio());
        profile.setExperience(dto.getExperience());
        profile.setUpdatedAt(LocalDateTime.now());

        SpecialistProfile updated = specialistProfileRepository.save(profile);
        return toDto(updated);
    }

    private SpecialistProfileDto toDto(SpecialistProfile profile) {
        return SpecialistProfileDto.builder()
                .id(profile.getId())
                .bio(profile.getBio())
                .experience(profile.getExperience())
                .rating(profile.getRating())
                .verified(profile.isVerified())
                .userEmail(profile.getUser().getEmail())
                .build();
    }
}