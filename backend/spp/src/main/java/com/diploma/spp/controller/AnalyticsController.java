package com.diploma.spp.controller;

import com.diploma.spp.dto.AnalyticsDto;
import com.diploma.spp.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/specialist/{specialistId}")
    @PreAuthorize("hasAuthority('SPECIALIST')")
    public ResponseEntity<AnalyticsDto> getSpecialistAnalytics(
            @PathVariable Long specialistId) {
        return ResponseEntity.ok(analyticsService.getSpecialistAnalytics(specialistId));
    }
}