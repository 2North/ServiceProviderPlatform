package com.diploma.spp.service;

import com.diploma.spp.dto.*;
import com.diploma.spp.exception.ResourceNotFoundException;
import com.diploma.spp.model.User;
import com.diploma.spp.repository.AnalyticsRepository;
import com.diploma.spp.repository.SpecialistProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SpecialistAnalyticsService {

    private final AnalyticsRepository analyticsRepository;
    private final SpecialistProfileRepository profileRepository;

    // Resolves and validates ownership — the caller passes the profile id from the security context
    private Long resolveAndVerify() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return profileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Specialist profile not found"))
                .getId();
    }

    @Cacheable(value = "analytics-revenue", key = "#profileId + '_' + #from + '_' + #to")
    public List<RevenueDayDto> getRevenue(Long profileId, LocalDate from, LocalDate to) {
        verifyOwnership(profileId);
        return analyticsRepository.getRevenue(profileId, from, to);
    }

    @Cacheable(value = "analytics-workload", key = "#profileId + '_' + #from + '_' + #to")
    public List<WorkloadDayDto> getWorkload(Long profileId, LocalDate from, LocalDate to) {
        verifyOwnership(profileId);
        return analyticsRepository.getWorkload(profileId, from, to);
    }

    @Cacheable(value = "analytics-rating", key = "#profileId + '_' + #from + '_' + #to")
    public List<RatingDayDto> getRatingHistory(Long profileId, LocalDate from, LocalDate to) {
        verifyOwnership(profileId);
        return analyticsRepository.getRatingHistory(profileId, from, to);
    }

    @Cacheable(value = "analytics-breakdown", key = "#profileId")
    public List<ServiceBreakdownDto> getServicesBreakdown(Long profileId) {
        verifyOwnership(profileId);
        return analyticsRepository.getServicesBreakdown(profileId);
    }

    @Cacheable(value = "analytics-summary", key = "#profileId")
    public AnalyticsSummaryDto getSummary(Long profileId) {
        verifyOwnership(profileId);
        return analyticsRepository.getSummary(profileId);
    }

    private void verifyOwnership(Long profileId) {
        Long ownProfileId = resolveAndVerify();
        if (!ownProfileId.equals(profileId)) {
            throw new com.diploma.spp.exception.ForbiddenException("Access denied");
        }
    }
}
