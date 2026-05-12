package com.diploma.spp.service;

import com.diploma.spp.dto.AnalyticsDto;
import com.diploma.spp.model.BookingStatus;
import com.diploma.spp.model.ReviewStatus;
import com.diploma.spp.repository.BookingRepository;
import com.diploma.spp.repository.ReviewRepository;
import com.diploma.spp.repository.ServiceRepository;
import com.diploma.spp.repository.SpecialistProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final BookingRepository bookingRepository;
    private final ReviewRepository reviewRepository;
    private final SpecialistProfileRepository specialistProfileRepository;

    public AnalyticsDto getSpecialistAnalytics(Long specialistId) {
        specialistProfileRepository.findById(specialistId)
                .orElseThrow(() -> new RuntimeException("Specialist not found"));

        var allBookings = bookingRepository.findByService_SpecialistProfile_Id(specialistId);

        long totalBookings = allBookings.size();
        long completedBookings = allBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.COMPLETED).count();
        long cancelledBookings = allBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.CANCELLED).count();
        long pendingBookings = allBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.PENDING).count();

        var reviews = reviewRepository.findBySpecialist_Id(specialistId).stream()
                .filter(r -> r.getStatus() == ReviewStatus.APPROVED)
                .toList();

        double averageRating = reviews.stream()
                .mapToInt(r -> r.getRating())
                .average()
                .orElse(0.0);

        BigDecimal totalEarnings = allBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.COMPLETED)
                .map(b -> b.getService().getPrice())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return AnalyticsDto.builder()
                .specialistId(specialistId)
                .totalBookings(totalBookings)
                .completedBookings(completedBookings)
                .cancelledBookings(cancelledBookings)
                .pendingBookings(pendingBookings)
                .averageRating(averageRating)
                .totalReviews((long) reviews.size())
                .totalEarnings(totalEarnings)
                .build();
    }
}