package com.diploma.spp.repository;

import com.diploma.spp.model.Review;
import com.diploma.spp.model.ReviewStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findBySpecialist_Id(Long specialistId);

    List<Review> findByClient_Id(Long clientId);

    Optional<Review> findByBooking_Id(Long bookingId);

    List<Review> findByStatus(ReviewStatus status);
}