package com.diploma.spp.controller;

import com.diploma.spp.dto.TimeSlotDto;
import com.diploma.spp.service.TimeSlotService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/slots")
@RequiredArgsConstructor
public class TimeSlotController {

    private final TimeSlotService timeSlotService;

    @PostMapping
    @PreAuthorize("hasAuthority('SPECIALIST')")
    public ResponseEntity<TimeSlotDto> create(@RequestBody TimeSlotDto dto) {
        return ResponseEntity.ok(timeSlotService.create(dto));
    }

    @GetMapping("/specialist/{specialistId}")
    public ResponseEntity<List<TimeSlotDto>> getAvailable(@PathVariable Long specialistId) {
        return ResponseEntity.ok(timeSlotService.getAvailableBySpecialist(specialistId));
    }

    @GetMapping("/specialist/{specialistId}/date/{date}")
    public ResponseEntity<List<TimeSlotDto>> getByDate(
            @PathVariable Long specialistId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(timeSlotService.getBySpecialistAndDate(specialistId, date));
    }
}