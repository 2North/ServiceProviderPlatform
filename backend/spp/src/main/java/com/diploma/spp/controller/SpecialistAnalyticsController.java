package com.diploma.spp.controller;

import com.diploma.spp.dto.*;
import com.diploma.spp.service.SpecialistAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/specialists/{profileId}/analytics")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('SPECIALIST')")
public class SpecialistAnalyticsController {

    private final SpecialistAnalyticsService analyticsService;

    @GetMapping("/revenue")
    public ResponseEntity<List<RevenueDayDto>> revenue(
            @PathVariable Long profileId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(analyticsService.getRevenue(profileId, from, to));
    }

    @GetMapping("/workload")
    public ResponseEntity<List<WorkloadDayDto>> workload(
            @PathVariable Long profileId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(analyticsService.getWorkload(profileId, from, to));
    }

    @GetMapping("/rating-history")
    public ResponseEntity<List<RatingDayDto>> ratingHistory(
            @PathVariable Long profileId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(analyticsService.getRatingHistory(profileId, from, to));
    }

    @GetMapping("/services-breakdown")
    public ResponseEntity<List<ServiceBreakdownDto>> servicesBreakdown(
            @PathVariable Long profileId) {
        return ResponseEntity.ok(analyticsService.getServicesBreakdown(profileId));
    }

    @GetMapping("/summary")
    public ResponseEntity<AnalyticsSummaryDto> summary(@PathVariable Long profileId) {
        return ResponseEntity.ok(analyticsService.getSummary(profileId));
    }
}
