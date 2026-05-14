package com.diploma.spp.service;

import com.diploma.spp.dto.ReviewDto;
import com.diploma.spp.exception.ConflictException;
import com.diploma.spp.exception.ResourceNotFoundException;
import com.diploma.spp.model.*;
import com.diploma.spp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final SpecialistProfileRepository specialistProfileRepository;

    @Transactional
    public ReviewDto create(ReviewDto dto) {
        Booking booking = bookingRepository.findById(dto.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (booking.getStatus() != BookingStatus.COMPLETED) {
            throw new IllegalArgumentException("Review can only be left for completed bookings");
        }

        if (reviewRepository.findByBooking_Id(dto.getBookingId()).isPresent()) {
            throw new ConflictException("Review already exists for this booking");
        }

        User client = userRepository.findById(dto.getClientId())
                .orElseThrow(() -> new ResourceNotFoundException("Client not found"));

        SpecialistProfile specialist = specialistProfileRepository.findById(dto.getSpecialistId())
                .orElseThrow(() -> new ResourceNotFoundException("Specialist not found"));

        Review review = Review.builder()
                .booking(booking)
                .client(client)
                .specialist(specialist)
                .rating(dto.getRating())
                .text(dto.getText())
                .status(ReviewStatus.APPROVED)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Review saved = reviewRepository.save(review);
        recalculateRating(specialist);
        return toDto(saved);
    }

    public List<ReviewDto> getBySpecialist(Long specialistId) {
        return reviewRepository.findBySpecialist_Id(specialistId)
                .stream()
                .filter(r -> r.getStatus() == ReviewStatus.APPROVED)
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public ReviewDto addReply(Long reviewId, String reply) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        review.setReply(reply);
        review.setUpdatedAt(LocalDateTime.now());
        return toDto(reviewRepository.save(review));
    }

    private void recalculateRating(SpecialistProfile specialist) {
        List<Review> reviews = reviewRepository.findBySpecialist_Id(specialist.getId())
                .stream()
                .filter(r -> r.getStatus() == ReviewStatus.APPROVED)
                .toList();

        if (reviews.isEmpty()) return;

        double avg = reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);

        specialist.setRating(BigDecimal.valueOf(avg).setScale(2, RoundingMode.HALF_UP));
        specialistProfileRepository.save(specialist);
    }

    private ReviewDto toDto(Review review) {
        return ReviewDto.builder()
                .id(review.getId())
                .bookingId(review.getBooking().getId())
                .clientId(review.getClient().getId())
                .specialistId(review.getSpecialist().getId())
                .rating(review.getRating())
                .text(review.getText())
                .reply(review.getReply())
                .status(review.getStatus())
                .createdAt(review.getCreatedAt())
                .build();
    }
}