package com.diploma.spp.controller;

import com.diploma.spp.dto.BookingDto;
import com.diploma.spp.model.BookingStatus;
import com.diploma.spp.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    @PreAuthorize("hasAuthority('CLIENT')")
    public ResponseEntity<BookingDto> create(@RequestBody BookingDto dto) {
        return ResponseEntity.ok(bookingService.create(dto));
    }

    @GetMapping("/client/{clientId}")
    @PreAuthorize("hasAuthority('CLIENT')")
    public ResponseEntity<List<BookingDto>> getByClient(@PathVariable Long clientId) {
        return ResponseEntity.ok(bookingService.getByClient(clientId));
    }

    @GetMapping("/specialist/{specialistId}")
    @PreAuthorize("hasAuthority('SPECIALIST')")
    public ResponseEntity<List<BookingDto>> getBySpecialist(@PathVariable Long specialistId) {
        return ResponseEntity.ok(bookingService.getBySpecialist(specialistId));
    }

    @PatchMapping("/{bookingId}/status")
    @PreAuthorize("hasAuthority('SPECIALIST')")
    public ResponseEntity<BookingDto> updateStatus(
            @PathVariable Long bookingId,
            @RequestParam BookingStatus status) {
        return ResponseEntity.ok(bookingService.updateStatus(bookingId, status));
    }
}