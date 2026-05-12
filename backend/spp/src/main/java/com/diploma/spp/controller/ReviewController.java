package com.diploma.spp.controller;

import com.diploma.spp.dto.ReviewDto;
import com.diploma.spp.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    @PreAuthorize("hasAuthority('CLIENT')")
    public ResponseEntity<ReviewDto> create(@RequestBody ReviewDto dto) {
        return ResponseEntity.ok(reviewService.create(dto));
    }

    @GetMapping("/specialist/{specialistId}")
    public ResponseEntity<List<ReviewDto>> getBySpecialist(@PathVariable Long specialistId) {
        return ResponseEntity.ok(reviewService.getBySpecialist(specialistId));
    }

    @PatchMapping("/{reviewId}/reply")
    @PreAuthorize("hasAuthority('SPECIALIST')")
    public ResponseEntity<ReviewDto> addReply(
            @PathVariable Long reviewId,
            @RequestParam String reply) {
        return ResponseEntity.ok(reviewService.addReply(reviewId, reply));
    }
}